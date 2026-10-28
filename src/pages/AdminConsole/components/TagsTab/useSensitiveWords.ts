// src/pages/AdminConsole/components/TagsTab/useSensitiveWords.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { SensitiveWord } from '@/types/wish';

export function useSensitiveWords() {
  const [words, setWords] = useState<SensitiveWord[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadWords = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sensitive_words')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setWords(data as SensitiveWord[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleAddWord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const clean = inputWord.trim();
      if (!clean) return alert('請輸入敏感詞名稱');
      setSubmitting(true);
      try {
        const { error } = await supabase.from('sensitive_words').insert({ word: clean });
        if (error) throw error;
        setInputWord('');
        await loadWords();
      } catch (err: unknown) {
        alert(`新增失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      } finally {
        setSubmitting(false);
      }
    },
    [inputWord, loadWords]
  );

  const handleDeleteWord = useCallback(
    async (id: string, word: string) => {
      if (!confirm(`確定要自違禁詞庫中移除「${word}」嗎？`)) return;
      try {
        await supabase.from('sensitive_words').delete().eq('id', id);
        await loadWords();
      } catch (err: unknown) {
        alert(`刪除失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      }
    },
    [loadWords]
  );

  return {
    words,
    inputWord,
    setInputWord,
    loading,
    submitting,
    handleAddWord,
    handleDeleteWord,
  };
}