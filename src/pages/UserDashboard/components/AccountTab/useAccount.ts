import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function useAccount() {
  const { session, profile, refreshProfile } = useAuth();
  const [realName, setRealName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

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
        } else if (profile && isMounted) {
          setRealName(profile.real_name ?? '');
          setNickname(profile.anonymous_nickname ?? '匿名星旅人');
          setPhone(profile.phone ?? '');
          setAddress(profile.address ?? '');
        }
      } catch (err) {
        console.warn(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, profile]);

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

      setSaving(true);
      try {
        const { error: upsertError } = await supabase.from('users').upsert(
          {
            id: currentUserId,
            real_name: realName.trim() || null,
            anonymous_nickname: nickname.trim() || '匿名星旅人',
            phone: phone.trim() || null,
            address: address.trim() || null,
          },
          { onConflict: 'id' }
        );

        if (upsertError) throw upsertError;

        await refreshProfile();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '儲存失敗');
      } finally {
        setSaving(false);
      }
    },
    [session?.user?.id, realName, nickname, phone, address, refreshProfile]
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
    loading,
    saving,
    saved,
    error,
    handleSave,
  };
}