// src/pages/UserDashboard/components/AccountTab/useAccount.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

/**
 * 台灣身分證字號真實加權驗證演算法 (Check ID)
 */
export const checkID = (id: string): boolean => {
  if (!/^[A-Z][12]\d{8}$/.test(id)) return false;
  const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
  const code = letters.indexOf(id[0]) + 10;
  const fullStr = code.toString() + id.slice(1);
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
  const sum = fullStr
    .split('')
    .reduce((acc, char, i) => acc + Number(char) * weights[i], 0);
  return sum % 10 === 0;
};

export function useAccount() {
  const { session, profile, refreshProfile } = useAuth();
  const [realName, setRealName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // 1. 身分證字號狀態 (檢視/修改)
  const [hasStoredId, setHasStoredId] = useState(false);
  const [storedMaskedId, setStoredMaskedId] = useState('');
  const [newIdInput, setNewIdInput] = useState('');
  const [isEditingId, setIsEditingId] = useState(false);

  // 2. 戶籍地址狀態 (比照身分證：檢視/修改)
  const [hasStoredDomicile, setHasStoredDomicile] = useState(false);
  const [storedDomicile, setStoredDomicile] = useState('');
  const [isEditingDomicile, setIsEditingDomicile] = useState(false);
  const [newDomicileInput, setNewDomicileInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const maskId = (rawId: string): string => {
    if (!rawId || rawId.length < 6) return rawId;
    return `${rawId.substring(0, 4)}****${rawId.substring(rawId.length - 2)}`;
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const currentUserId = session?.user?.id;
      if (!currentUserId) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const { data } = await supabase.from('users').select('*').eq('id', currentUserId).maybeSingle();
        if (data && isMounted) {
          setRealName(data.real_name ?? '');
          setNickname(data.anonymous_nickname ?? '匿名星旅人');
          setPhone(data.phone ?? '');
          setAddress(data.address ?? '');

          // 身分證初始判定
          if (data.id_number) {
            setHasStoredId(true);
            setStoredMaskedId(maskId(data.id_number));
            setIsEditingId(false);
          } else {
            setHasStoredId(false);
            setIsEditingId(true);
          }

          // 戶籍地址初始判定（比照身分證模式）
          if (data.domicile_address && data.domicile_address.trim().length > 0) {
            setHasStoredDomicile(true);
            setStoredDomicile(data.domicile_address);
            setNewDomicileInput(data.domicile_address);
            setIsEditingDomicile(false);
          } else {
            setHasStoredDomicile(false);
            setIsEditingDomicile(true);
          }
        }
      } catch (err) {
        console.warn('載入帳號資料異常:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const handleStartEditId = useCallback(() => {
    setIsEditingId(true);
    setNewIdInput('');
  }, []);

  const handleCancelEditId = useCallback(() => {
    if (hasStoredId) {
      setIsEditingId(false);
      setNewIdInput('');
      setError('');
    }
  }, [hasStoredId]);

  const handleStartEditDomicile = useCallback(() => {
    setIsEditingDomicile(true);
  }, []);

  const handleCancelEditDomicile = useCallback(() => {
    if (hasStoredDomicile) {
      setIsEditingDomicile(false);
      setNewDomicileInput(storedDomicile);
      setError('');
    }
  }, [hasStoredDomicile, storedDomicile]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSaved(false);

      const currentUserId = session?.user?.id;
      if (!currentUserId) {
        setError('找不到登入憑證，請重新登入');
        return;
      }

      // 🌟 1. 身分證真實權重校驗演算法檢查
      const cleanNewId = newIdInput.trim().toUpperCase();
      if (isEditingId && cleanNewId) {
        if (!checkID(cleanNewId)) {
          setError('此身分證字號無效');
          return;
        }
      }

      // 🌟 2. 戶籍地址編輯態校驗
      if (isEditingDomicile && newDomicileInput && !newDomicileInput.includes(']')) {
        setError('請完整選擇縣市與填寫戶籍地址各欄位');
        return;
      }

      setSaving(true);
      try {
        const updatePayload: Record<string, unknown> = {
          id: currentUserId,
          real_name: realName.trim() || null,
          anonymous_nickname: nickname.trim() || '匿名星旅人',
          phone: phone.trim() || null,
          address: address.trim() || null,
        };

        // 僅在身分證編輯狀態且有填寫新證號時更新
        if (isEditingId && cleanNewId) {
          updatePayload.id_number = cleanNewId;
        }

        // 僅在戶籍地址編輯狀態且有新組合地址時更新
        if (isEditingDomicile && newDomicileInput.trim()) {
          updatePayload.domicile_address = newDomicileInput.trim();
        }

        const { error: upsertError } = await supabase.from('users').upsert(updatePayload, { onConflict: 'id' });
        if (upsertError) throw upsertError;

        // 更新本地身分證狀態
        if (isEditingId && cleanNewId) {
          setHasStoredId(true);
          setStoredMaskedId(maskId(cleanNewId));
          setIsEditingId(false);
          setNewIdInput('');
        }

        // 更新本地戶籍地址狀態
        if (isEditingDomicile && newDomicileInput.trim()) {
          setHasStoredDomicile(true);
          setStoredDomicile(newDomicileInput.trim());
          setIsEditingDomicile(false);
        }

        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '儲存失敗');
      } finally {
        setSaving(false);
      }
    },
    [
      session?.user?.id,
      realName,
      nickname,
      phone,
      address,
      isEditingId,
      newIdInput,
      isEditingDomicile,
      newDomicileInput,
      refreshProfile,
    ]
  );

  return {
    email: session?.user?.email,
    isPhoneVerified: profile?.is_phone_verified,
    realName,
    setRealName,
    nickname,
    setNickname,
    phone,
    setPhone,
    address,
    setAddress,
    hasStoredId,
    storedMaskedId,
    newIdInput,
    setNewIdInput,
    isEditingId,
    hasStoredDomicile,
    storedDomicile,
    isEditingDomicile,
    newDomicileInput,
    setNewDomicileInput,
    loading,
    saving,
    saved,
    error,
    handleStartEditId,
    handleCancelEditId,
    handleStartEditDomicile,
    handleCancelEditDomicile,
    handleSave,
  };
}