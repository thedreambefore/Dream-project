// src/pages/UserDashboard/components/PublishTab/usePublish.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  fetchSensitiveWords,
  checkCanPublishNewWish,
} from '@/services/complianceService';
import type { Tag, Wish } from '@/types/wish';

export function usePublish(onRequireVerify: () => void) {
  const { session, profile, isBanned } = useAuth();

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [promise, setPromise] = useState('');

  // 運費快捷選項：商品原價 + 勾選超商運費 (+NT$ 60)
  const [basePrice, setBasePrice] = useState<number>(500);
  const [hasShippingFee, setHasShippingFee] = useState<boolean>(false);

  const finalPrice = useMemo(() => {
    return basePrice + (hasShippingFee ? 60 : 0);
  }, [basePrice, hasShippingFee]);

  const [productUrl, setProductUrl] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState('');
  const [coverEmoji, setCoverEmoji] = useState('Sparkles');

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 🌟 單一心願約束狀態
  const [isCheckingConstraint, setIsCheckingConstraint] = useState(true);
  const [publishBlockedReason, setPublishBlockedReason] = useState<string | null>(null);
  const [blockingWish, setBlockingWish] = useState<Wish | null>(null);

  // 檢查是否符合發布條件
  const verifyEligibility = useCallback(async () => {
    if (!session?.user?.id) return;
    setIsCheckingConstraint(true);
    const result = await checkCanPublishNewWish(session.user.id);
    if (!result.canPublish) {
      setPublishBlockedReason(result.reason || '尚有未完成的心願活動');
      setBlockingWish(result.blockingWish || null);
    } else {
      setPublishBlockedReason(null);
      setBlockingWish(null);
    }
    setIsCheckingConstraint(false);
  }, [session?.user?.id]);

  useEffect(() => {
    verifyEligibility();
  }, [verifyEligibility]);

  useEffect(() => {
    supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTags(data as Tag[]);
          setTagName(data[0].name);
        }
      });
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片格式檔案 (JPG / PNG / WebP)');
      return;
    }

    setCompressing(true);
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageBase64(compressedDataUrl);
        }
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePublishClick = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (isBanned) {
        setError('🚫 您的帳號已被停權，無法發布任何心願。');
        return;
      }

      if (!profile?.is_phone_verified) {
        onRequireVerify();
        return;
      }

      // 再次進行發布資格閘門校驗
      if (publishBlockedReason) {
        setError(publishBlockedReason);
        return;
      }

      if (!tagName.trim()) {
        setError('請選擇分類標籤（如無標籤請聯絡管理員設定）');
        return;
      }

      // 🌟 動態違禁詞校驗
      const currentSensitiveWords = await fetchSensitiveWords();
      for (const word of currentSensitiveWords) {
        if (title.includes(word) || story.includes(word) || promise.includes(word)) {
          setError(`防護盾牌提示：內容包含敏感詞 [ ${word} ]，請修正後再提交。`);
          return;
        }
      }

      if (title.length > 20) {
        setError('標題不能超過 20 字');
        return;
      }
      if (story.length > 200) {
        setError('故事內文不能超過 200 字');
        return;
      }
      if (finalPrice < 50 || finalPrice > 20000) {
        setError('心願星塵數額限定在 50 ~ 20,000 顆之間（依合規防止機會中獎稅門檻）');
        return;
      }
      if (!productUrl.trim()) {
        setError('電商商品連結不可為空，請填寫外部 B2C 電商之商品網址以供審核');
        return;
      }

      setSubmitting(true);
      try {
        const currentUserId = session?.user?.id;
        if (!currentUserId) throw new Error('請先登入');

        const payload = {
          user_id: currentUserId,
          title: title.trim(),
          product_name: title.trim(),
          product_price: Number(finalPrice),
          current_stardust: 0,
          tag_name: tagName,
          cover_emoji: coverEmoji,
          story_text: story.trim(),
          promise_text: promise.trim() || '心願達成後公開回饋與開箱感謝信！',
          image_url: imageBase64,
          product_url: productUrl.trim() || null,
          status: 'pending',
          block_reason: null,
        };

        const { error: insertError } = await supabase.from('wishes').insert(payload);
        if (insertError) throw insertError;

        setSuccess(true);
        setTitle('');
        setStory('');
        setPromise('');
        setProductUrl('');
        setImageBase64(null);
        setHasShippingFee(false);
        verifyEligibility();
      } catch (err: unknown) {
        setError(`發布失敗: ${err instanceof Error ? err.message : '請確認網路狀態'}`);
      } finally {
        setSubmitting(false);
      }
    },
    [
      isBanned,
      profile?.is_phone_verified,
      onRequireVerify,
      publishBlockedReason,
      tagName,
      title,
      story,
      promise,
      finalPrice,
      productUrl,
      session?.user?.id,
      coverEmoji,
      imageBase64,
      verifyEligibility,
    ]
  );

  return {
    title,
    setTitle,
    story,
    setStory,
    promise,
    setPromise,
    basePrice,
    setBasePrice,
    hasShippingFee,
    setHasShippingFee,
    finalPrice,
    productUrl,
    setProductUrl,
    tags,
    tagName,
    setTagName,
    coverEmoji,
    setCoverEmoji,
    imageBase64,
    setImageBase64,
    compressing,
    submitting,
    error,
    success,
    setSuccess,
    isCheckingConstraint,
    publishBlockedReason,
    blockingWish,
    handleImageChange,
    handlePublishClick,
    verifyEligibility,
  };
}