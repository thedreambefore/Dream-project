// src/pages/UserDashboard/components/PublishTab/usePublish.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { checkCanPublishNewWish, checkTextViolations } from '@/services/complianceService';
import type { Tag, Wish } from '@/types/wish';

export function usePublish(onRequireVerify: () => void) {
  const { session, profile, isBanned } = useAuth();

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [promise, setPromise] = useState('');
  const [basePrice, setBasePrice] = useState<number>(500);
  const [hasShippingFee, setHasShippingFee] = useState<boolean>(false);

  const finalPrice = useMemo(() => basePrice + (hasShippingFee ? 60 : 0), [basePrice, hasShippingFee]);

  const [productUrl, setProductUrl] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState('');
  const [coverEmoji, setCoverEmoji] = useState('Sparkles');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [isCheckingConstraint, setIsCheckingConstraint] = useState(true);
  const [publishBlockedReason, setPublishBlockedReason] = useState<string | null>(null);
  const [blockingWish, setBlockingWish] = useState<Wish | null>(null);

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
    if (!file || !file.type.startsWith('image/')) return;

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
          setImageBase64(canvas.toDataURL('image/jpeg', 0.7));
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

      if (isBanned) return setError('🚫 您的帳號已被停權，無法發布任何心願。');
      if (!profile?.is_phone_verified) return onRequireVerify();
      if (publishBlockedReason) return setError(publishBlockedReason);
      if (!tagName.trim()) return setError('請選擇分類標籤');

      // 🌟 違禁詞綜合檢驗
      const violation = await checkTextViolations([title, story, promise]);
      if (violation.hasBlocked) {
        return setError(`內容包含封禁詞 [ ${violation.blockedWord} ]，請修正後再提交。`);
      }

      if (title.length > 20) return setError('標題不能超過 20 字');
      if (story.length > 200) return setError('故事內文不能超過 200 字');
      if (finalPrice < 50 || finalPrice > 20000) return setError('心願星塵數額限定在 50 ~ 20,000 顆之間');
      if (!productUrl.trim()) return setError('請填寫外部電商商品網址');

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
        setError(`發布失敗: ${err instanceof Error ? err.message : '連線異常'}`);
      } finally {
        setSubmitting(false);
      }
    },
    [isBanned, profile?.is_phone_verified, onRequireVerify, publishBlockedReason, tagName, title, story, promise, finalPrice, productUrl, session?.user?.id, coverEmoji, imageBase64, verifyEligibility]
  );

  return {
    title, setTitle, story, setStory, promise, setPromise,
    basePrice, setBasePrice, hasShippingFee, setHasShippingFee, finalPrice,
    productUrl, setProductUrl, tags, tagName, setTagName,
    coverEmoji, setCoverEmoji, imageBase64, setImageBase64,
    compressing, submitting, error, success, setSuccess,
    isCheckingConstraint, publishBlockedReason, blockingWish,
    handleImageChange, handlePublishClick, verifyEligibility,
  };
}