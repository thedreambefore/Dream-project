// src/pages/AdminConsole/components/TagsTab/index.tsx
import { Tag } from 'lucide-react';
import { useTags } from './useTags';
import { TagCreateForm } from './components/TagCreateForm';
import { TagCardGrid } from './components/TagCardGrid';

export function TagsTab() {
  const t = useTags();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2"><Tag className="w-4 h-4 text-amber-300" /> 分類標籤庫管理</h2>
        <p className="text-xs text-zinc-400 mt-0.5">在此新增或移除的標籤將即時同步於前台篩選列與心願發布選單。</p>
      </div>

      <TagCreateForm name={t.name} setName={t.setName} submitting={t.submitting} onSubmit={t.handleAdd} />
      <TagCardGrid tags={t.tags} onDelete={t.handleDelete} />
    </div>
  );
}

export default TagsTab;