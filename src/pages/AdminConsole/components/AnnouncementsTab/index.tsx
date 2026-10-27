// src/pages/AdminConsole/components/AnnouncementsTab/index.tsx
import { Megaphone } from 'lucide-react';
import { useAnnouncements } from './useAnnouncements';
import { AnnouncementPublishForm } from './components/AnnouncementPublishForm';
import { AnnouncementCardList } from './components/AnnouncementCardList';
import { EditAnnouncementModal } from './EditAnnouncementModal';

export function AnnouncementsTab() {
  const a = useAnnouncements();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2"><Megaphone className="w-4 h-4 text-amber-300" /> 全站廣播公告部署管理</h2>
        <p className="text-xs text-zinc-400 mt-0.5">在此發布與編輯的公告將直接進入首頁頂部星空廣播站進行流體自動輪播。</p>
      </div>

      <AnnouncementPublishForm title={a.title} setTitle={a.setTitle} body={a.body} setBody={a.setBody} isSubmitting={a.isSubmitting} onSubmit={a.handlePublish} />
      <AnnouncementCardList announcements={a.announcements} loading={a.loading} onToggle={a.handleToggle} onOpenEdit={a.handleOpenEdit} onDelete={a.handleDelete} />

      {a.editingAnn && (
        <EditAnnouncementModal
          editTitle={a.editTitle} setEditTitle={a.setEditTitle} editBody={a.editBody} setEditBody={a.setEditBody}
          isSavingEdit={a.isSavingEdit} onClose={() => a.setEditingAnn(null)} onSave={a.handleSaveEdit}
        />
      )}
    </div>
  );
}

export default AnnouncementsTab;