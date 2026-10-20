import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { AdminUserItem } from '../../types';

export function useUsersManagement() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers((data as AdminUserItem[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleBan = useCallback(
    async (user: AdminUserItem) => {
      const isBanned = user.role === 'banned';
      const newRole = isBanned ? 'user' : 'banned';
      const actionText = isBanned ? '解除停權' : '永久停權';

      if (!confirm(`確定要將用戶「${user.anonymous_nickname || user.id}」${actionText} 嗎？`)) {
        return;
      }

      await supabase.from('users').update({ role: newRole }).eq('id', user.id);
      loadUsers();
    },
    [loadUsers]
  );

  return {
    users,
    loading,
    handleToggleBan,
  };
}