import { Megaphone, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { useAnnouncements } from './useAnnouncements';
import { EditAnnouncementModal } from './EditAnnouncementModal';

export function AnnouncementsTab() {
  const {
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
  } = useAnnouncements();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-300" /> 全站廣播公告部署管理
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          在此發布與編輯的公告將直接進入首頁頂部星空廣播站進行流體自動輪播。
        </p>
      </div>

      <form
        onSubmit={handlePublish}
        className="glass rounded-2xl p-5 glow-border space-y-3.5 bg-zinc-900/60 border border-amber-400/20"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
          <Plus className="w-4 h-4 text-amber-400" /> 發布新公告
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">公告主標題 (建議 15~25 字)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：星空心願回饋活動正式上線！"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
            required
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">公告內文說明 (固定規格展示)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="請輸入欲廣播給所有星旅人的詳細溫暖訊息..."
            rows={2}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
          即刻部署發布至首頁廣播站
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs text-zinc-400 px-1 font-mono">
          <span>現有公告列表 ({announcements.length} 則)</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">載入公告清單中...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-2xl bg-zinc-900/20 text-zinc-500 text-xs">
            目前暫無自訂公告，首頁正呈現官方預設備用廣播。
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className={`glass rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border transition-all ${
                ann.is_active ? 'border-amber-400/20 bg-zinc-900/50' : 'border-white/5 bg-zinc-950/40 opacity-70'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      ann.is_active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {ann.is_active ? '輪播中' : '已停用'}
                  </span>
                  <h4 className="font-bold text-amber-100 text-sm">{ann.title}</h4>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{ann.body}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(ann)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    ann.is_active
                      ? 'bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  }`}
                >
                  {ann.is_active ? '停用' : '啟用'}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(ann)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-400/30 text-amber-200 hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> 編輯
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingAnn && (
        <EditAnnouncementModal
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editBody={editBody}
          setEditBody={setEditBody}
          isSavingEdit={isSavingEdit}
          onClose={() => setEditingAnn(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}