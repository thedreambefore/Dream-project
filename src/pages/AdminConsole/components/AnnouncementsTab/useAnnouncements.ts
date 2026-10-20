import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Announcement } from '@/types/wish';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data as Announcement[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handlePublish = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !body.trim()) return alert('請填寫標題與內容');
      setIsSubmitting(true);
      try {
        const { error } = await supabase.from('announcements').insert({
          title: title.trim(),
          body: body.trim(),
          is_active: true,
        });

        if (error) throw error;
        alert('公告發布成功！已同步上線至首頁輪播。');
        setTitle('');
        setBody('');
        loadAnnouncements();
      } catch (err: unknown) {
        alert(`發布失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, body, loadAnnouncements]
  );

  const handleToggle = useCallback(async (ann: Announcement) => {
    try {
      await supabase
        .from('announcements')
        .update({ is_active: !ann.is_active })
        .eq('id', ann.id);

      setAnnouncements((prev) =>
        prev.map((item) => (item.id === ann.id ? { ...item, is_active: !ann.is_active } : item))
      );
    } catch (err: unknown) {
      alert(`狀態切換失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  }, []);

  const handleOpenEdit = useCallback((ann: Announcement) => {
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditBody(ann.body);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingAnn) return;
    if (!editTitle.trim() || !editBody.trim()) return alert('請完整填寫標題與內容');
    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: editTitle.trim(),
          body: editBody.trim(),
        })
        .eq('id', editingAnn.id);

      if (error) throw error;
      alert('公告更新成功！');
      setEditingAnn(null);
      loadAnnouncements();
    } catch (err: unknown) {
      alert(`更新失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setIsSavingEdit(false);
    }
  }, [editingAnn, editTitle, editBody, loadAnnouncements]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('確定要永久刪除此則公告嗎？此動作無法復原。')) return;
    try {
      await supabase.from('announcements').delete().eq('id', id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      alert(`刪除失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  }, []);

  return {
    announcements,
    loading,
    title,
    setTitle,
    body,
    setBody,
    isSubmitting,
    editingAnn,
    setEditingAnn,
    editTitle,
    setEditTitle,
    editBody,
    setEditBody,
    isSavingEdit,
    handlePublish,
    handleToggle,
    handleOpenEdit,
    handleSaveEdit,
    handleDelete,
  };
}