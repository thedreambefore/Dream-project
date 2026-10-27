// src/components/HomeHeroCarousel/useHeroCarousel.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Announcement } from '@/types/wish';

const EMPTY_FALLBACK_ANNOUNCEMENT: Announcement = {
  id: 'empty-fallback',
  title: '目前這裡沒有資訊喔',
  body: '星空廣播站靜候新訊息中，請隨時留意最新公告。',
  is_active: true,
  created_at: new Date().toISOString(),
};

export function useHeroCarousel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([EMPTY_FALLBACK_ANNOUNCEMENT]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data.length > 0 ? (data as Announcement[]) : [EMPTY_FALLBACK_ANNOUNCEMENT]);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    const channel = supabase
      .channel('public-announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnnouncements]);

  const switchSlide = useCallback(
    (newIndex: number, dir: 'left' | 'right') => {
      if (isTransitioning) return;
      setDirection(dir);
      setIsTransitioning(true);
      setCurrentIndex(newIndex);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [isTransitioning]
  );

  const handlePrev = useCallback(() => {
    const nextIdx = (currentIndex - 1 + announcements.length) % announcements.length;
    switchSlide(nextIdx, 'left');
  }, [currentIndex, announcements.length, switchSlide]);

  const handleNext = useCallback(() => {
    const nextIdx = (currentIndex + 1) % announcements.length;
    switchSlide(nextIdx, 'right');
  }, [currentIndex, announcements.length, switchSlide]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(handleNext, 6500);
    return () => clearInterval(timer);
  }, [announcements.length, handleNext]);

  return {
    announcements,
    current: announcements[currentIndex] || announcements[0],
    currentIndex,
    direction,
    isTransitioning,
    hasMultiple: announcements.length > 1,
    switchSlide,
    handlePrev,
    handleNext,
  };
}