// src/pages/AdminConsole/components/TagsTab/useSensitiveWords.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getCustomSensitiveWords,
  addSensitiveWord,
  deleteSensitiveWord,
} from '@/services/complianceService';
import type { SensitiveWord } from '@/types/wish';

export function useSensitiveWords() {
  const [words, setWords] = useState<SensitiveWord[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadWords = useCallback(async () => {
    setLoading(true);
    const list = await getCustomSensitiveWords();
    setWords(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const handleAddWord = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const clean = inputWord.trim();
      if (!clean) return alert('請輸入欲封禁的詞彙');

      setSubmitting(true);
      try {
        const newWordObj = await addSensitiveWord(clean);
        setWords((prev) => [newWordObj, ...prev]);
        setInputWord('');
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : '新增失敗');
      } finally {
        setSubmitting(false);
      }
    },
    [inputWord]
  );

  const handleDeleteWord = useCallback(
    async (id: string, word: string) => {
      if (!confirm(`確定要解禁詞彙「${word}」嗎？`)) return;
      try {
        await deleteSensitiveWord(id);
        setWords((prev) => prev.filter((w) => w.id !== id));
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : '移除失敗');
      }
    },
    []
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