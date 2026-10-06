import { useEffect, useState, useCallback } from 'react';
import { supabase, type Story, type Tag, type Announcement } from '@/lib/supabase';
import { fetchPublicWishes } from '@/lib/backend';

export function usePublicData() {
  const [stories, setStories] = useState<Story[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStories = useCallback(async () => {
    setStories(await fetchPublicWishes());
  }, []);

  const loadTags = useCallback(async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });
    setTags((data as Tag[]) || []);
  }, []);

  const loadAnnouncement = useCallback(async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setAnnouncement(data as Announcement | null);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStories(), loadTags(), loadAnnouncement()]);
    setLoading(false);
  }, [loadStories, loadTags, loadAnnouncement]);

  useEffect(() => {
    refreshAll();

    const storyChannel = supabase
      .channel('public-wishes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => loadStories())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => loadStories())
      .subscribe();

    const tagChannel = supabase
      .channel('public-tags')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => loadTags())
      .subscribe();

    const announcementChannel = supabase
      .channel('public-announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => loadAnnouncement())
      .subscribe();

    return () => {
      supabase.removeChannel(storyChannel);
      supabase.removeChannel(tagChannel);
      supabase.removeChannel(announcementChannel);
    };
  }, [refreshAll, loadStories, loadTags, loadAnnouncement]);

  return { stories, tags, announcement, loading, refreshAll };
}
