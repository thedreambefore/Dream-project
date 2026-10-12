// src/pages/AdminConsole.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Megaphone,
  Tag,
  Loader2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  LogOut,
  Users,
  ExternalLink,
  Edit3,
  Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  blockWish,
  fetchAllWishesForAdmin,
  isBlockedStatus,
  unblockWish,
  updateWish,
} from '@/lib/backend';
import type { Wish, Tag as TagType, Announcement } from '@/types/wish';

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
          <button
            onClick={onGoHome}
            className="touch-btn w-full bg-amber-500/15 border border-amber-400/30 text-amber-200 rounded-xl py-3 hover:bg-amber-500/25 transition-all"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto">
      {/* 頂部導覽列 */}
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
          <button
            onClick={onClose}
            className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 標籤導覽列 */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-5xl mx-auto">
          <AdminTabButton id="pending" activeTab={activeTab} onClick={setActiveTab} icon={<CheckCircle2 className="w-4 h-4 text-amber-400" />} label="🚀 待審核願望" />
          <AdminTabButton id="moderation" activeTab={activeTab} onClick={setActiveTab} icon={<Ban className="w-4 h-4" />} label="卡片審查與出貨" />
          <AdminTabButton id="users" activeTab={activeTab} onClick={setActiveTab} icon={<Users className="w-4 h-4" />} label="用戶名冊 (Ban)" />
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

function AdminTabButton({
  id,
  activeTab,
  onClick,
  icon,
  label,
}: {
  id: AdminTab;
  activeTab: AdminTab;
  onClick: (id: AdminTab) => void;
  icon: React.ReactNode;
  label: string;
}) {
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

// ===== 1. 待審核工作台 =====
function PendingApprovalTab() {
  const [stories, setStories] = useState<Wish[]>([]);
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

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        載入待審核願望...
      </div>
    );
  }

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
          🎉 目前所有願望皆已完成審核！
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

              <div className="bg-black/40 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed border border-white/5">
                <p className="font-bold text-zinc-400 mb-1">【故事內文】</p>
                {story.story_text}
                <p className="font-bold text-zinc-400 mt-2 mb-0.5">【終章承諾】</p>
                <span className="text-amber-200/90">{story.promise_text}</span>
              </div>

              {story.product_url && (
                <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>電商驗證連結：</span>
                  <a href={story.product_url} target="_blank" rel="noreferrer" className="underline truncate max-w-md">
                    {story.product_url}
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

// ===== 2. 卡片審查與出貨台 =====
function ModerationTab() {
  const [stories, setStories] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'reported' | 'letters' | 'fulfilled' | 'all'>('reported');

  const [shippingStory, setShippingStory] = useState<Wish | null>(null);
  const [investmentsList, setInvestmentsList] = useState<any[]>([]);
  const [adminBlessing, setAdminBlessing] = useState('');
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [shippingSubmit, setShippingSubmit] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    setStories(await fetchAllWishesForAdmin());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const reportedWishes = stories.filter((s) => s.is_reported && !isBlockedStatus(s.status));
  const pendingLetters = stories.filter((s) => s.letter_status === 'pending');
  const fulfilledWishes = stories.filter(
    (s) =>
      (s.status === 'full_funded' || Number(s.current_stardust) >= Number(s.product_price)) &&
      s.status !== 'fulfilled'
  );

  const handleApproveLetter = async (id: string) => {
    await updateWish(id, { letter_status: 'approved' });
    alert('✅ 感謝信已審核通過！');
    loadStories();
  };

  const handleRejectLetter = async (id: string) => {
    const reason = prompt('請輸入感謝信駁回修改原因：', '感謝信內容過於簡略，或照片未清晰拍攝商品。');
    if (!reason) return;
    await updateWish(id, { letter_status: 'rejected', letter_reject_reason: reason });
    alert('已駁回，創作者可根據理由重新提交。');
    loadStories();
  };

  const handleOpenShippingModal = async (story: Wish) => {
    setShippingStory(story);
    setAdminBlessing('');
    setLoadingInvestments(true);

    const { data } = await supabase
      .from('investments')
      .select('*, users:user_id(anonymous_nickname)')
      .or(`wish_id.eq.${story.id},story_id.eq.${story.id}`)
      .order('created_at', { ascending: true });

    setInvestmentsList(data || []);
    setLoadingInvestments(false);
  };

  const handleToggleHideMessage = async (invId: string, currentHidden: boolean) => {
    await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', invId);
    setInvestmentsList((prev) =>
      prev.map((item) => (item.id === invId ? { ...item, is_hidden: !currentHidden } : item))
    );
  };

  const handleConfirmShipment = async () => {
    if (!shippingStory) return;
    setShippingSubmit(true);
    try {
      const defaultBlessing = '🌟 夢沙星空見證了這份純粹的善意，願這份溫暖伴隨你迎向嶄新的明天！';

      const { data: invList } = await supabase
        .from('investments')
        .select('user_id, amount')
        .or(`wish_id.eq.${shippingStory.id},story_id.eq.${shippingStory.id}`);

      if (invList && invList.length > 0) {
        const userSums: Record<string, number> = {};
        invList.forEach((inv) => {
          if (inv.user_id) {
            userSums[inv.user_id] = (userSums[inv.user_id] || 0) + Number(inv.amount || 0);
          }
        });

        for (const [userId, addAmount] of Object.entries(userSums)) {
          const { data: userData } = await supabase
            .from('users')
            .select('wallet_balance')
            .eq('id', userId)
            .maybeSingle();

          const currentBalance = Number(userData?.wallet_balance || 0);
          await supabase
            .from('users')
            .update({ wallet_balance: currentBalance + addAmount })
            .eq('id', userId);
        }
      }

      await updateWish(shippingStory.id, {
        status: 'fulfilled',
        admin_blessing: adminBlessing.trim() || defaultBlessing,
      });

      alert('🎉 已完成出貨審查！榮譽點數已全數結算！');
      setShippingStory(null);
      loadStories();
    } catch (e: any) {
      alert(`出貨失敗: ${e.message}`);
    } finally {
      setShippingSubmit(false);
    }
  };

  const handleDismissReport = async (id: string) => {
    await updateWish(id, { is_reported: false, report_reason: null });
    alert('已駁回檢舉。');
    loadStories();
  };

  const handleConfirmBlock = async (id: string, reason: string) => {
    await blockWish(id, reason || '管理員查核違規下架');
    loadStories();
  };

  const handleUnblock = async (id: string) => {
    await unblockWish(id);
    loadStories();
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        載入審查中心...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-lg font-bold text-red-200 flex items-center gap-2">
          <Ban className="w-5 h-5" /> 卡片巡檢與物流出貨台
        </h2>

        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl gap-1 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setSubTab('reported')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              subTab === 'reported' ? 'bg-red-500/20 text-red-300
