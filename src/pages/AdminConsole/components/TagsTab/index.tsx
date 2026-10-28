// src/pages/AdminConsole/components/TagsTab/index.tsx
import { Tag } from 'lucide-react';
import { useTags } from './useTags';
import { useSensitiveWords } from './useSensitiveWords';
import { TagCreateForm } from './components/TagCreateForm';
import { TagCardGrid } from './components/TagCardGrid';
import { SensitiveWordsSection } from './components/SensitiveWordsSection';

export function TagsTab() {
  const t = useTags();
  const s = useSensitiveWords();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2"><Tag className="w-4 h-4 text-amber-300" /> 分類標籤庫管理</h2>
        <p className="text-xs text-zinc-400 mt-0.5">在此新增或移除的標籤將即時同步於前台篩選列與心願發布選單。</p>
      </div>
      <TagCreateForm name={t.name} setName={t.setName} submitting={t.submitting} onSubmit={t.handleAdd} />
      <TagCardGrid tags={t.tags} onDelete={t.handleDelete} />
      <SensitiveWordsSection
        words={s.words} inputWord={s.inputWord} setInputWord={s.setInputWord}
        loading={s.loading} submitting={s.submitting} onAdd={s.handleAddWord} onDelete={s.handleDeleteWord}
      />
    </div>
  );
}

export default TagsTab;