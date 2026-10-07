import { useState, useEffect, useCallback } from 'react';
import { X, Megaphone, Tag, Shield, Plus, Loader2, Ban, CheckCircle2, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import { supabase, type Story, type Tag as TagType, type Announcement } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { blockWish, fetchAllWishesForAdmin, isBlockedStatus, unblockWish } from '@/lib/backend';

type AdminTab = 'announcements' | 'tags' | 'moderation';

export function AdminConsole({ onClose, onGoHome }: { onClose: () => void; onGoHome: () => void }) {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('moderation');

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 space-bg flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-300 mb-2">權限不足</h2>
          <p className="text-sm text-gray-400 mb-4">此區域僅限管理員存取</p>
          <button onClick={onGoHome} className="touch-btn w-full bg-amber-500/15 border border-amber-400/30 text-amber-200 rounded-xl py-3 hover:bg-amber-500/25 transition-all">
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong border-b border-red-400/10 px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo — always navigates to home */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <span className="text-2xl">⏳</span>
          <span className="text-lg font-bold text-amber-100 glow-text">夢沙</span>
          <span className="text-sm text-gray-400 hidden sm:inline">DreamSand</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="hidden sm:flex items-center gap-1 text-xs text-red-300 mr-2">
            <Shield className="w-3.5 h-3.5" />
            管理員後台
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="touch-btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">登出</span>
          </button>
          <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-5xl mx-auto">
          <AdminTabButton id="moderation" activeTab={activeTab} onClick={setActiveTab} icon={<Ban className="w-4 h-4" />} label="卡片審查" />
          <AdminTabButton id="announcements" activeTab={activeTab} onClick={setActiveTab} icon={<Megaphone className="w-4 h-4" />} label="公告部署" />
          <AdminTabButton id="tags" activeTab={activeTab} onClick={setActiveTab} icon={<Tag className="w-4 h-4" />} label="Tag 管理" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'tags' && <TagsTab />}
      </div>
    </div>
  );
}

function AdminTabButton({ id, activeTab, onClick, icon, label }: { id: AdminTab; activeTab: AdminTab; onClick: (id: AdminTab) => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`touch-btn flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm ${
        activeTab === id
          ? 'border-red-400 text-red-200 font-bold'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ===== Moderation Tab =====
function ModerationTab() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockingStory, setBlockingStory] = useState<Story | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const loadStories = useCallback(async () => {
    setStories(await fetchAllWishesForAdmin());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStories();
    const channel = supabase
      .channel('admin-wishes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => loadStories())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => loadStories())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadStories]);

  const handleBlock = async () => {
    if (!blockingStory) return;
    await blockWish(blockingStory.id, blockReason || '管理員判定違規');
    setBlockingStory(null);
    setBlockReason('');
    loadStories();
  };

  const handleUnblock = async (story: Story) => {
    await unblockWish(story.id);
    loadStories();
  };

  if (loading) return <div className="text-center py-16 text-gray-400">載入中...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-red-200 flex items-center gap-2">
        <Ban className="w-5 h-5" />
        卡片審查與封鎖維護
      </h2>
      <p className="text-sm text-gray-400">共 {stories.length} 張故事卡片。封鎖後該卡片將立即從前台首頁消失。</p>

      {stories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">尚無故事卡片</div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`glass rounded-2xl p-4 border transition-all ${
                story.status === 'blocked'
                  ? 'border-red-500/30 opacity-60'
                  : 'border-amber-400/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{story.cover_emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-amber-100">{story.product_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      story.status === 'approved' ? 'bg-green-500/15 text-green-300' :
                      isBlockedStatus(story.status) ? 'bg-red-500/15 text-red-300' :
                      story.status === 'fulfilled' ? 'bg-blue-500/15 text-blue-300' :
                      'bg-yellow-500/15 text-yellow-300'
                    }`}>
                      {story.status === 'approved' ? '已通過' :
                       isBlockedStatus(story.status) ? '已封鎖' :
                       story.status === 'fulfilled' ? '已履約' : '待審核'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{story.story_text}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>#{story.tag_name}</span>
                    <span>{story.current_stardust}/{story.product_price} 星塵</span>
                    <span>{new Date(story.created_at).toLocaleDateString('zh-TW')}</span>
                    {story.block_reason && (
                      <span className="text-red-400">封鎖原因：{story.block_reason}</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isBlockedStatus(story.status) ? (
                    <button
                      onClick={() => handleUnblock(story)}
                      className="touch-btn px-3 py-2 rounded-lg bg-green-500/15 border border-green-400/30 text-green-300 hover:bg-green-500/25 transition-all text-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      解除封鎖
                    </button>
                  ) : (
                    <button
                      onClick={() => setBlockingStory(story)}
                      className="touch-btn px-3 py-2 rounded-lg bg-red-500/25 border border-red-400/50 text-red-200 hover:bg-red-500/35 transition-all text-sm font-bold flex items-center gap-1 pulse-gold"
                    >
                      <Ban className="w-4 h-4" />
                      封鎖/屏蔽此卡片
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Block reason modal */}
      {blockingStory && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm scale-in"
          onClick={() => setBlockingStory(null)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-md p-6 glow-border border-red-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-red-300 mb-2 flex items-center gap-2">
              <Ban className="w-5 h-5" />
              確認封鎖卡片
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              封鎖後「{blockingStory.product_name}」將立即從前台首頁消失。
            </p>
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1.5">封鎖原因</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="例：內容不當、疑似詐騙..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-400/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setBlockingStory(null); setBlockReason(''); }}
                className="touch-btn flex-1 bg-white/5 border border-white/10 text-gray-300 rounded-xl py-3 hover:bg-white/10 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleBlock}
                className="touch-btn flex-1 bg-red-500/20 border border-red-400/40 text-red-300 font-bold rounded-xl py-3 hover:bg-red-500/30 transition-all"
              >
                確認封鎖
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Announcements Tab =====
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements((data as Announcement[]) || []);
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setLoading(true);
    await supabase.from('announcements').insert({ title, body, is_active: true });
    setTitle('');
    setBody('');
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    loadAnnouncements();
  };

  const handleToggle = async (ann: Announcement) => {
    await supabase
      .from('announcements')
      .update({ is_active: !ann.is_active })
      .eq('id', ann.id);
    loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadAnnouncements();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-amber-300" />
        公告發布
      </h2>
      <p className="text-sm text-gray-400">發布後首頁橫幅即時連動變更。</p>

      {success && (
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl px-4 py-3 text-sm text-green-300 flex items-center gap-2 scale-in">
          <CheckCircle2 className="w-4 h-4" />
          公告已發布！首頁橫幅已即時更新。
        </div>
      )}

      <form onSubmit={handlePublish} className="glass rounded-2xl p-5 glow-border space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">公告標題</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：新年特別活動開跑！"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">公告內容</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="輸入公告詳情..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4" />}
          發布公告
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-300">歷史公告</h3>
        {announcements.map((ann) => (
          <div key={ann.id} className="glass rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-amber-100 text-sm truncate">{ann.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${ann.is_active ? 'bg-green-500/15 text-green-300' : 'bg-gray-500/15 text-gray-400'}`}>
                  {ann.is_active ? '顯示中' : '已停用'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{ann.body}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleToggle(ann)}
                className="touch-btn px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-amber-200 text-xs transition-all"
              >
                {ann.is_active ? '停用' : '啟用'}
              </button>
              <button
                onClick={() => handleDelete(ann.id)}
                className="touch-btn px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 text-xs transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Tags Tab =====
function TagsTab() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadTags = useCallback(async () => {
    const { data } = await supabase.from('tags').select('*').order('sort_order', { ascending: true });
    setTags((data as TagType[]) || []);
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    const maxSort = tags.length > 0 ? Math.max(...tags.map((t) => t.sort_order)) : 0;
    await supabase.from('tags').insert({
      name,
      icon,
      sort_order: maxSort + 1,
    });
    setName('');
    setIcon('🏷️');
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
    loadTags();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tags').delete().eq('id', id);
    loadTags();
  };

  const iconOptions = ['🏷️', '✏️', '📱', '🏠', '👕', '🍜', '✨', '🎮', '📚', '🎵', '🐾', '🌿', '💡', '🔧', '⭐', '🌙'];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
        <Tag className="w-5 h-5 text-amber-300" />
        Tag 分類管理
      </h2>
      <p className="text-sm text-gray-400">新增後首頁篩選列即時多出該標籤並可連動篩選。</p>

      {success && (
        <div className="bg-green-500/10 border border-green-400/30 rounded-xl px-4 py-3 text-sm text-green-300 flex items-center gap-2 scale-in">
          <CheckCircle2 className="w-4 h-4" />
          標籤已新增！首頁篩選列已即時更新。
        </div>
      )}

      <form onSubmit={handleAdd} className="glass rounded-2xl p-5 glow-border space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">標籤名稱</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：遊戲玩具"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">標籤圖示</label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                className={`w-10 h-10 touch-btn rounded-lg text-xl transition-all ${
                  icon === e ? 'bg-amber-500/25 border border-amber-400/50' : 'bg-white/5 border border-white/10 hover:border-amber-400/20'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4" />}
          新增標籤
        </button>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-300">現有標籤 ({tags.length})</h3>
        {tags.map((tag) => (
          <div key={tag.id} className="glass rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{tag.icon}</span>
              <span className="text-sm text-amber-100 font-medium">{tag.name}</span>
            </div>
            <button
              onClick={() => handleDelete(tag.id)}
              className="touch-btn px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 text-xs transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
