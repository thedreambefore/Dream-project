import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Tag } from '@/types/wish';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTags = useCallback(async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setTags(data as Tag[]);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const cleanName = name.trim().replace(/^#/, '');
      if (!cleanName) return alert('請輸入標籤名稱');

      setSubmitting(true);
      try {
        const maxSort = tags.length > 0 ? Math.max(...tags.map((t) => t.sort_order || 0)) : 0;
        const { error } = await supabase.from('tags').insert({
          name: cleanName,
          icon: '#',
          sort_order: maxSort + 1,
        });

        if (error) throw error;

        alert(`標籤 #${cleanName} 新增成功！`);
        setName('');
        await loadTags();
      } catch (err: unknown) {
        alert(`新增失敗: ${err instanceof Error ? err.message : '請確認權限或連線'}`);
      } finally {
        setSubmitting(false);
      }
    },
    [name, tags, loadTags]
  );

  const handleDelete = useCallback(
    async (id: string, tagName: string) => {
      if (!confirm(`確定要刪除標籤 #${tagName} 嗎？`)) return;
      try {
        const { error } = await supabase.from('tags').delete().eq('id', id);
        if (error) throw error;
        await loadTags();
      } catch (err: unknown) {
        alert(`刪除失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      }
    },
    [loadTags]
  );

  return {
    tags,
    name,
    setName,
    submitting,
    handleAdd,
    handleDelete,
  };
}