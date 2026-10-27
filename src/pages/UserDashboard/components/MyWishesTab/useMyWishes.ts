// src/pages/UserDashboard/components/MyWishesTab/useMyWishes.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import type { Wish } from '@/types/wish';

export type MyWishesFilter = 'all' | 'approved' | 'pending' | 'fulfilled' | 'blocked';

export function useMyWishes() {
  const { session, profile, refreshProfile } = useAuth();
  const [myWishes, setMyWishes] = useState<Wish[]>([]);
  const [filterTag, setFilterTag] = useState<MyWishesFilter>('all');
  const [loading, setLoading] = useState(true);

  // 編輯心願狀態
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number>(500);
  const [editProductUrl, setEditProductUrl] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editPromise, setEditPromise] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // 感謝信狀態
  const [letterWish, setLetterWish] = useState<Wish | null>(null);
  const [thankYouLetter, setThankYouLetter] = useState('');
  const [unboxingPhoto, setUnboxingPhoto] = useState<string | null>(null);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [savingLetter, setSavingLetter] = useState(false);

  const loadMyWishes = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    setMyWishes((data as Wish[]) || []);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    loadMyWishes();
    refreshProfile(); // 確保切換進心願追蹤館時取得最新 profile 稅務資訊
  }, [loadMyWishes, refreshProfile]);

  const handleStartEdit = useCallback((w: Wish) => {
    setEditingWish(w);
    setEditTitle(w.product_name || w.title || '');
    setEditPrice(Number(w.product_price) || 500);
    setEditProductUrl(w.product_url || '');
    setEditStory(w.story_text || '');
    setEditPromise(w.promise_text || '');
  }, []);

  const handleResubmit = useCallback(async () => {
    if (!editingWish) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('wishes')
        .update({
          title: editTitle.trim(),
          product_name: editTitle.trim(),
          product_price: Number(editPrice),
          product_url: editProductUrl.trim() || null,
          story_text: editStory.trim(),
          promise_text: editPromise.trim(),
          status: 'pending',
          block_reason: null,
        })
        .eq('id', editingWish.id);

      if (error) throw error;
      alert('已重新提交！請等待管理員審核。');
      setEditingWish(null);
      loadMyWishes();
    } catch (e: unknown) {
      alert(`更新失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    } finally {
      setSavingEdit(false);
    }
  }, [editingWish, editTitle, editPrice, editProductUrl, editStory, editPromise, loadMyWishes]);

  const handleOpenLetterModal = useCallback((w: Wish) => {
    setLetterWish(w);
    setThankYouLetter(w.thank_you_letter || '');
    setUnboxingPhoto(w.unboxing_photo_url || null);
  }, []);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setUnboxingPhoto(canvas.toDataURL('image/jpeg', 0.7));
        }
        setCompressingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmitLetter = useCallback(async () => {
    if (!letterWish || !thankYouLetter.trim()) {
      alert('請填寫感謝信內文');
      return;
    }
    setSavingLetter(true);
    try {
      await supabase
        .from('wishes')
        .update({
          thank_you_letter: thankYouLetter.trim(),
          unboxing_photo_url: unboxingPhoto,
          letter_status: 'pending',
          letter_reject_reason: null,
        })
        .eq('id', letterWish.id);

      alert('💌 開箱感謝信已提交管理團隊審核！通過後將公開於所有支持者的追番牆！');
      setLetterWish(null);
      loadMyWishes();
    } catch (e: unknown) {
      alert(`提交失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    } finally {
      setSavingLetter(false);
    }
  }, [letterWish, thankYouLetter, unboxingPhoto, loadMyWishes]);

  const filteredList = useMemo(() => {
    return myWishes.filter((w) => {
      if (filterTag === 'all') return true;
      if (filterTag === 'approved') return w.status === 'approved';
      if (filterTag === 'pending') return w.status === 'pending';
      if (filterTag === 'blocked') return w.status === 'blocked';
      if (filterTag === 'fulfilled') return w.status === 'fulfilled' || w.status === 'full_funded';
      return true;
    });
  }, [myWishes, filterTag]);

  // 🌟 核心防線：只要身分證號與戶籍地址皆已完備（非空），taxDeclarationWish 必為 undefined，100% 隱藏提醒橫幅！
  const taxDeclarationWish = useMemo(() => {
    const hasValidId = Boolean(profile?.id_number && profile.id_number.trim().length > 0);
    const hasValidDomicile = Boolean(profile?.domicile_address && profile.domicile_address.trim().length > 0);

    // 資料已齊全，直接放行，不顯示提醒橫幅
    if (hasValidId && hasValidDomicile) {
      return undefined;
    }

    // 只有在資料未齊備、且存在滿千達成的心願時才顯示
    return myWishes.find((w) => {
      const isFunded =
        w.status === 'full_funded' ||
        w.status === 'fulfilled' ||
        Number(w.current_stardust) >= Number(w.product_price);
      const isOverThreshold = Number(w.product_price || 0) >= 1000;
      return isFunded && isOverThreshold;
    });
  }, [myWishes, profile?.id_number, profile?.domicile_address]);

  return {
    filteredList,
    filterTag,
    setFilterTag,
    taxDeclarationWish,
    loading,
    editingWish,
    setEditingWish,
    editTitle,
    setEditTitle,
    editPrice,
    setEditPrice,
    editProductUrl,
    setEditProductUrl,
    editStory,
    setEditStory,
    editPromise,
    setEditPromise,
    savingEdit,
    handleStartEdit,
    handleResubmit,
    letterWish,
    setLetterWish,
    thankYouLetter,
    setThankYouLetter,
    unboxingPhoto,
    setUnboxingPhoto,
    compressingPhoto,
    savingLetter,
    handleOpenLetterModal,
    handlePhotoUpload,
    handleSubmitLetter,
  };
}