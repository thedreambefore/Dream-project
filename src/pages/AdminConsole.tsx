import { useState, useEffect, useCallback } from 'react';
import { X, Megaphone, Tag, Shield, Plus, Loader2, Ban, CheckCircle2, AlertTriangle, Trash2, LogOut, Users, ExternalLink } from 'lucide-react';
import { supabase, type Story, type Tag as TagType, type Announcement } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { blockWish, fetchAllWishesForAdmin, isBlockedStatus, unblockWish, updateWish } from '@/lib/backend';

type AdminTab = 'pending' | 'moderation' | 'users' | 'announcements' | 'tags';

export function AdminConsole({ onClose, onGoHome }: { onClose: () => void; onGoHome: () => void }) {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');

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
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <span className="text-2xl">⏳</span>
          <span className="text-lg font-bold text-amber-100 glow-text">夢沙</span>
          <span className="text-sm text-gray-400 hidden sm:inline">管理總控制台</span>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="touch-btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">登出管理員</span>
          </button>
          <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 標籤導覽列 */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-5xl mx-auto">
          <AdminTabButton id="pending" activeTab={activeTab} onClick={setActiveTab} icon={<CheckCircle2 className="w-4 h-4 text-amber-400" />} label="🚀 待審核願望" />
          <AdminTabButton id="moderation" activeTab={activeTab} onClick={setActiveTab} icon={<Ban className="w-4 h-4" />} label="卡片審查與封鎖" />
          <AdminTabButton id="users" activeTab={activeTab} onClick={setActiveTab} icon={<Users className="w-4 h-4" />} label="用戶名冊與停權 (Ban)" />
          <AdminTabButton id="announcements" activeTab={activeTab} onClick={setActiveTab} icon={<Megaphone className="w-4 h-4" />} label="公告部署" />
          <AdminTabButton id="tags" activeTab={activeTab} onClick={setActiveTab} icon={<Tag className="w-4 h-4" />} label="Tag 管理" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'pending' && <PendingApprovalTab />}
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'users' && <UsersManagementTab />}
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
      className={`touch-btn flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm cursor-pointer ${
        activeTab === id ? 'border-amber-400 text-amber-200 font-bold bg-white/5' : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ===== 1. 待審核願望清單 (Pending Approval Tab) =====
function PendingApprovalTab() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = useCallback(async () => {
    setLoading(true);
    const all = await fetchAllWishesForAdmin();
    setStories(all.filter((s) => s.status === 'pending'));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = async (id: string) => {
    await updateWish(id, { status: 'approved' });
    alert('✅ 審核通過！該願望卡片已正式登上首頁願望交易所。');
    loadPending();
  };

  const handleReject = async (id: string) => {
    const reason = prompt('請輸入駁回原因：', '內容描述不全或未符合規範');
    if (!reason) return;
    await blockWish(id, reason);
    loadPending();
  };

  if (loading) return <div className="text-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />載入待審核願望...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-400" /> 人工審核工作台
          </h2>
          <p className="text-xs text-gray-400">用戶提交的願望卡片預設為 pending，審核通過後前台才會即時連動渲染。</p>
        </div>
        <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
          待審核：{stories.length} 件
        </span>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20">
          🎉 目前所有願望皆已完成審核，星海一片安寧！
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story.id} className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{story.cover_emoji}</span>
                  <div>
                    <h3 className="font-bold text-amber-100 text-base">{story.product_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="text-amber-300">#{story.tag_name}</span>
                      <span>•</span>
                      <span>目標：NT$ {story.product_price.toLocaleString()}</span>
                      <span>•</span>
                      <span>{new Date(story.created_at).toLocaleString('zh-TW')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(story.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    ✓ 通過上架
                  </button>
                  <button
                    onClick={() => handleReject(story.id)}
                    className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs transition-all cursor-pointer"
                  >
                    駁回
                  </button>
                </div>
              </div>

              {/* 故事內文查驗 */}
              <div className="bg-black/40 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed border border-white/5">
                <p className="font-bold text-zinc-400 mb-1">【故事內文】</p>
                {story.story_text}
                <p className="font-bold text-zinc-400 mt-2 mb-0.5">【終章承諾】</p>
                <span className="text-amber-200/90">{story.promise_text}</span>
              </div>

              {/* 電商連結檢查 */}
              {(story as any).product_url && (
                <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>電商驗證連結：</span>
                  <a href={(story as any).product_url} target="_blank" rel="noreferrer" className="underline truncate max-w-md">
                    {(story as any).product_url}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 2. 卡片審查與封鎖 (Moderation Tab) =====
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
  }, [loadStories]);

  const handleBlock = async () => {
    if (!blockingStory) return;
    await blockWish(blockingStory.id, blockReason || '管理員判定違規下架');
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
        <Ban className="w-5 h-5" /> 全站卡片監控與封鎖管理
      </h2>
      <p className="text-sm text-gray-400">共 {stories.length} 張故事卡片。封鎖後將立即從前台交易所隱藏。</p>

      <div className="space-y-3">
        {stories.map((story) => (
          <div
            key={story.id}
            className={`glass rounded-2xl p-4 border transition-all ${
              isBlockedStatus(story.status) ? 'border-red-500/40 opacity-70 bg-red-950/10' : 'border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{story.cover_emoji}</span>
                <div>
                  <h3 className="font-bold text-amber-100">{story.product_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className={`px-2 py-0.5 rounded-full ${
                      story.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                      isBlockedStatus(story.status) ? 'bg-red-500/20 text-red-300' :
                      story.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {story.status === 'approved' ? '展示中' :
                       isBlockedStatus(story.status) ? '已封鎖' :
                       story.status === 'pending' ? '待審核' : '已履約'}
                    </span>
                    <span>#{story.tag_name}</span>
                    <span>{story.current_stardust}/{story.product_price} 星塵</span>
                  </div>
                </div>
              </div>

              <div>
                {isBlockedStatus(story.status) ? (
                  <button
                    onClick={() => handleUnblock(story)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold hover:bg-emerald-500/25 transition-all"
                  >
                    解除封鎖
                  </button>
                ) : (
                  <button
                    onClick={() => setBlockingStory(story)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-1"
                  >
                    <Ban className="w-3.5 h-3.5" /> 封鎖此卡片
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {blockingStory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-md p-6 glow-border border-red-500/30 bg-zinc-950">
            <h3 className="text-base font-bold text-red-300 mb-2">確認封鎖「{blockingStory.product_name}」？</h3>
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="請填寫封鎖理由 (如不實資訊、侵權)..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white mb-4 focus:outline-none focus:border-red-400/50"
            />
            <div className="flex gap-2">
              <button onClick={() => setBlockingStory(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs text-gray-300">取消</button>
              <button onClick={handleBlock} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs">確認封鎖下架</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 3. 用戶名冊與停權 (Users Management Tab) =====
function UsersManagementTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 停權 / 解除停權 切換
  const handleToggleBan = async (user: any) => {
    const isBanned = user.role === 'banned';
    const newRole = isBanned ? 'user' : 'banned';
    const actionText = isBanned ? '解除停權' : '永久停權 (Ban)';

    if (!confirm(`確定要將用戶「${user.anonymous_nickname || user.id}」${actionText} 嗎？`)) return;

    await supabase.from('users').update({ role: newRole }).eq('id', user.id);
    loadUsers();
  };

  if (loading) return <div className="text-center py-16 text-gray-400">載入用戶名冊中...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-200 flex items-center gap-2">
        <Users className="w-5 h-5 text-amber-400" /> 星旅人名冊與停權管理 (Ban)
      </h2>
      <p className="text-xs text-gray-400">管理員可直接管理註冊者權限，停權者將被限制發布與留言功能。</p>

      <div className="space-y-2.5">
        {users.map((u) => (
          <div key={u.id} className="glass rounded-xl p-4 flex items-center justify-between border border-white/5 bg-zinc-900/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-100 text-sm">{u.anonymous_nickname || '匿名星旅人'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  u.role === 'admin' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30' :
                  u.role === 'banned' ? 'bg-zinc-800 text-red-400 font-black' : 'bg-emerald-500/10 text-emerald-300'
                }`}>
                  {u.role === 'admin' ? '👑 管理員' : u.role === 'banned' ? '🚫 已停權 (Banned)' : '一般用戶'}
                </span>
                {u.is_phone_verified && <span className="text-[10px] text-emerald-400">✓ 手機已驗證</span>}
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1">ID: {u.id} · 錢包: {u.wallet_balance || 0} ✨</p>
            </div>

            {u.role !== 'admin' && (
              <button
                onClick={() => handleToggleBan(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  u.role === 'banned'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25'
                }`}
              >
                {u.role === 'banned' ? '解鎖還原' : '🚫 封鎖停權 (Ban)'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 4. 公告 Tab (原有功能優雅保留) =====
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements((data as Announcement[]) || []);
  }, []);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setLoading(true);
    await supabase.from('announcements').insert({ title, body, is_active: true });
    setTitle(''); setBody(''); setLoading(false);
    loadAnnouncements();
  };

  const handleToggle = async (ann: Announcement) => {
    await supabase.from('announcements').update({ is_active: !ann.is_active }).eq('id', ann.id);
    loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadAnnouncements();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2"><Megaphone className="w-5 h-5 text-amber-300" /> 全站廣播公告</h2>
      <form onSubmit={handlePublish} className="glass rounded-2xl p-5 glow-border space-y-3">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="公告標題" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" required />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="公告內容..." rows={2} className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none resize-none" required />
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs">{loading ? '發布中...' : '發布全站公告'}</button>
      </form>
      <div className="space-y-2">
        {announcements.map((ann) => (
          <div key={ann.id} className="glass rounded-xl p-3 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-amber-200">{ann.title}</p>
              <p className="text-zinc-400">{ann.body}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleToggle(ann)} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-300">{ann.is_active ? '停用' : '啟用'}</button>
              <button onClick={() => handleDelete(ann.id)} className="p-1 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 5. Tags Tab (原有功能優雅保留) =====
function TagsTab() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');

  const loadTags = useCallback(async () => {
    const { data } = await supabase.from('tags').select('*').order('sort_order', { ascending: true });
    setTags((data as TagType[]) || []);
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const maxSort = tags.length > 0 ? Math.max(...tags.map((t) => t.sort_order)) : 0;
    await supabase.from('tags').insert({ name, icon, sort_order: maxSort + 1 });
    setName(''); loadTags();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('tags').delete().eq('id', id);
    loadTags();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2"><Tag className="w-5 h-5 text-amber-300" /> 分類標籤管理</h2>
      <form onSubmit={handleAdd} className="glass rounded-2xl p-5 glow-border flex gap-2">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="新標籤名稱" className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none" required />
        <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs">新增標籤</button>
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tags.map((t) => (
          <div key={t.id} className="glass rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-amber-200">{t.icon} #{t.name}</span>
            <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
