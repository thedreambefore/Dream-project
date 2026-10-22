// src/pages/UserDashboard/components/AccountTab/useAccount.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

// 台灣身分證字號正規格式檢驗
const TW_ID_REGEX = /^[A-Z][1289]\d{8}$/;

export function useAccount() {
  const { session, profile, refreshProfile } = useAuth();
  const [realName, setRealName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // 🌟 身分證與戶籍地址狀態
  const [hasStoredId, setHasStoredId] = useState(false);
  const [storedMaskedId, setStoredMaskedId] = useState('');
  const [newIdInput, setNewIdInput] = useState('');
  const [isEditingId, setIsEditingId] = useState(false);
  const [domicileAddress, setDomicileAddress] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // 脫敏遮罩函式：A123456789 -> A123****89
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
          setDomicileAddress(data.domicile_address ?? '');

          if (data.id_number) {
            setHasStoredId(true);
            setStoredMaskedId(maskId(data.id_number));
            setIsEditingId(false);
          } else {
            setHasStoredId(false);
            setIsEditingId(true);
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

      // 🌟 安全檢驗：如果使用者正在編輯輸入新身分證
      const cleanNewId = newIdInput.trim().toUpperCase();
      if (isEditingId && cleanNewId) {
        if (!TW_ID_REGEX.test(cleanNewId)) {
          setError('身分證字號格式不正確，需為 1 碼大寫英文字母 ＋ 9 碼數字');
          return;
        }
      }

      setSaving(true);
      try {
        const updatePayload: Record<string, unknown> = {
          id: currentUserId,
          real_name: realName.trim() || null,
          anonymous_nickname: nickname.trim() || '匿名星旅人',
          phone: phone.trim() || null,
          address: address.trim() || null,
          domicile_address: domicileAddress.trim() || null,
        };

        // 🌟 核心防覆蓋保護：只有在編輯模式且有輸入新身分證時，才覆蓋後端！
        // 若處於鎖定脫敏檢視態，絕對不傳送 id_number 欄位，杜絕星號覆蓋！
        if (isEditingId && cleanNewId) {
          updatePayload.id_number = cleanNewId;
        }

        const { error: upsertError } = await supabase.from('users').upsert(updatePayload, { onConflict: 'id' });

        if (upsertError) throw upsertError;

        if (isEditingId && cleanNewId) {
          setHasStoredId(true);
          setStoredMaskedId(maskId(cleanNewId));
          setIsEditingId(false);
          setNewIdInput('');
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
      domicileAddress,
      isEditingId,
      newIdInput,
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
    domicileAddress,
    setDomicileAddress,
    loading,
    saving,
    saved,
    error,
    handleStartEditId,
    handleCancelEditId,
    handleSave,
  };
}