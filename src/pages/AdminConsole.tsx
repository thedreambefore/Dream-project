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
  Hourglass,
  Flag,
  Mail,
  Package,
  Layers,
  Shield,
  EyeOff,
  Check,
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
        <div className="glass-strong rounded-2xl p-8 text-center max-w-sm border border-red-500/20 bg-zinc-950">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-300 mb-2">權限不足</h2>
          <p className="text-xs text-zinc-400 mb-4">此核心控制台僅限星空管理團隊存取</p>
          <button
            onClick={onGoHome}
            className="touch-btn w-full bg-amber-500/15 border border-amber-400/30 text-amber-200 rounded-xl py-3 hover:bg-amber-500/25 transition-all text-xs font-bold"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto bg-zinc-950 text-white select-none">
      {/* 頂部導覽列 */}
      <div className="sticky top-0 z-10 glass-strong border-b border-red-500/20 px-4 sm:px-6 h-16 flex items-center justify-between bg-zinc-950/95 backdrop-blur-md">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Hourglass className="w-5 h-5 text-amber-400" />
          <span className="text-base font-bold text-amber-100 glow-text">夢沙 DreamSand</span>
          <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full ml-1">
            總控制台
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignOut}
            className="touch-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition-all text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">登出管理員</span>
          </button>
          <button
            onClick={onClose}
            className="touch-btn rounded-full hover:bg-white/10 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 標籤導覽列 (全線條向量 Icon) */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-5xl mx-auto">
          <AdminTabButton id="pending" activeTab={activeTab} onClick={setActiveTab} icon={<CheckCircle2 className="w-4 h-4 text-amber-400" />} label="待審核活動" />
          <AdminTabButton id="moderation" activeTab={activeTab} onClick={setActiveTab} icon={<Package className="w-4 h-4 text-emerald-400" />} label="巡檢與物流出貨" />
          <AdminTabButton id="users" activeTab={activeTab} onClick={setActiveTab} icon={<Users className="w-4 h-4 text-sky-400" />} label="星旅人名冊" />
          <AdminTabButton id="announcements" activeTab={activeTab} onClick={setActiveTab} icon={<Megaphone className="w-4 h-4 text-purple-400" />} label="全站公告部署" />
          <AdminTabButton id="tags" activeTab={activeTab} onClick={setActiveTab} icon={<Tag className="w-4 h-4 text-yellow-400" />} label="分類標籤管理" />
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
      className={`touch-btn flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-xs font-bold cursor-pointer ${
        activeTab === id ? 'border-amber-400 text-amber-200 bg-white/5' : 'border-transparent text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {icon} <span>{label}</span>
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
    alert('審核通過！該願望卡片已正式登上首頁願望交易所。');
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
      <div className="text-center py-16 text-zinc-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-300" />
        載入待審核活動中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" /> 人工合規審核工作台
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">用戶提交的心願預設為 pending，人工查驗電商網址與內容通過後才於前台點亮。</p>
        </div>
        <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
          待審核：{stories.length} 件
        </span>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
          目前所有心願皆已完成審核。
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story.id} className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-amber-100 text-sm">{story.product_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono">
                    <span className="text-amber-300">#{story.tag_name}</span>
                    <span>•</span>
                    <span>目標：{story.product_price.toLocaleString()} 星塵</span>
                    <span>•</span>
                    <span>{new Date(story.created_at).toLocaleString('zh-TW')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(story.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> 通過上架
                  </button>
                  <button
                    onClick={() => handleReject(story.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs transition-all cursor-pointer"
                  >
                    駁回
                  </button>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed border border-white/5">
                <p className="font-bold text-zinc-400 mb-1">【故事說明】</p>
                {story.story_text}
                <p className="font-bold text-zinc-400 mt-2 mb-0.5">【終章承諾】</p>
                <span className="text-amber-200/90">{story.promise_text}</span>
              </div>

              {story.product_url && (
                <div className="flex items-center gap-2 text-xs text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>電商驗證網址：</span>
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
    alert('感謝信已審核通過並公開推播！');
    loadStories();
  };

  const handleRejectLetter = async (id: string) => {
    const reason = prompt('請輸入駁回原因：', '內容過於簡略，或未附上清晰商品成果照。');
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
      const defaultBlessing = '夢沙星空見證了這份純粹的善意，願這份溫暖伴隨你迎向嶄新的明天！';

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

      alert('物流審查完成！榮譽星塵已全數結算至贊助者帳戶。');
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
      <div className="text-center py-16 text-zinc-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-300" />
        載入審查中心...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-base font-bold text-red-200 flex items-center gap-2">
          <Package className="w-4 h-4 text-emerald-400" /> 卡片巡檢與物流贈禮履約台
        </h2>

        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl gap-1 overflow-x-auto hide-scrollbar text-xs">
          <button
            onClick={() => setSubTab('reported')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'reported' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>待查檢舉 ({reportedWishes.length})</span>
          </button>
          <button
            onClick={() => setSubTab('letters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'letters' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>感謝信審核 ({pendingLetters.length})</span>
          </button>
          <button
            onClick={() => setSubTab('fulfilled')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'fulfilled' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>滿額待出貨 ({fulfilledWishes.length})</span>
          </button>
          <button
            onClick={() => setSubTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTab === 'all' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>全站卡片 ({stories.length})</span>
          </button>
        </div>
      </div>

      {subTab === 'letters' && (
        <div className="space-y-3">
          {pendingLetters.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
              目前無待審核的開箱感謝信。
            </div>
          ) : (
            pendingLetters.map((story) => (
              <div key={story.id} className="glass rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full">
                      創作者已提交開箱信待審
                    </span>
                    <h3 className="font-bold text-amber-100 text-sm mt-2">{story.product_name}</h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectLetter(story.id)}
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold hover:bg-red-500/30"
                    >
                      駁回修改
                    </button>
                    <button
                      onClick={() => handleApproveLetter(story.id)}
                      className="px-3 py-1.5 bg-purple-500 text-zinc-950 font-bold rounded-lg text-xs hover:bg-purple-400"
                    >
                      審核通過並推播
                    </button>
                  </div>
                </div>

                {story.unboxing_photo_url && (
                  <div className="h-44 max-w-sm rounded-xl overflow-hidden border border-white/10">
                    <img src={story.unboxing_photo_url} alt="開箱照" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed">
                  <p className="font-bold text-zinc-400 mb-1">【創作者感謝信內文】</p>
                  {story.thank_you_letter || '(無內文)'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'fulfilled' && (
        <div className="space-y-3">
          {fulfilledWishes.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
              目前暫無滿額待出貨項目。
            </div>
          ) : (
            fulfilledWishes.map((story) => (
              <div key={story.id} className="glass rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/15 flex justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    活動已 100% 達成
                  </span>
                  <h3 className="font-bold text-amber-100 text-sm mt-2">{story.product_name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                    累積星星: {story.current_stardust.toLocaleString()} / {story.product_price.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {story.product_url && (
                    <a
                      href={story.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>查看商品</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenShippingModal(story)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>審核留言並確認出貨</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'reported' && (
        <div className="space-y-3">
          {reportedWishes.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
              目前無被檢舉卡片。
            </div>
          ) : (
            reportedWishes.map((story) => (
              <div key={story.id} className="glass rounded-2xl p-4 border border-red-500/30 bg-red-950/15 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-100 text-sm">{story.product_name}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => handleDismissReport(story.id)} className="px-2.5 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-lg">駁回檢舉</button>
                    <button onClick={() => handleConfirmBlock(story.id, story.report_reason || '檢舉違規')} className="px-2.5 py-1 text-xs bg-red-500 text-white font-bold rounded-lg">確認下架</button>
                  </div>
                </div>
                <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded-lg">
                  檢舉理由：{story.report_reason || '內容不符規範'}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'all' && (
        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story.id} className="glass rounded-xl p-4 flex justify-between items-center border border-white/5 bg-zinc-900/40">
              <div>
                <p className="font-bold text-sm text-amber-100">{story.product_name}</p>
                <p className="text-xs text-zinc-500 font-mono">狀態: {story.status} · 進度: {story.current_stardust}/{story.product_price}</p>
              </div>
              <div>
                {isBlockedStatus(story.status) ? (
                  <button onClick={() => handleUnblock(story.id)} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg cursor-pointer">解除封鎖</button>
                ) : (
                  <button onClick={() => handleConfirmBlock(story.id, '手動封鎖')} className="px-2.5 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg cursor-pointer">封鎖</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {shippingStory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-strong rounded-3xl w-full max-w-xl p-6 glow-border border-emerald-400/30 bg-zinc-950 space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-emerald-300">物流出貨與留言審核終章</h3>
                <p className="text-xs text-zinc-400">心願活動：{shippingStory.product_name}</p>
              </div>
              <button onClick={() => setShippingStory(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-amber-200 mb-2">贊助者留言名冊 ({investmentsList.length} 則)</p>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
                {loadingInvestments ? (
                  <p className="text-xs text-zinc-500 text-center py-4">讀取留言中...</p>
                ) : investmentsList.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">此活動無留言存底。</p>
                ) : (
                  investmentsList.map((inv) => (
                    <div
                      key={inv.id}
                      className={`p-2.5 rounded-xl border text-xs flex justify-between items-center gap-2 ${
                        inv.is_hidden ? 'bg-red-950/20 border-red-500/30 opacity-60' : 'bg-zinc-900 border-white/5'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-amber-400 font-mono font-bold">+{inv.amount} 星</span>
                          <span className="text-[10px] text-zinc-400">by {inv.users?.anonymous_nickname || '匿名星旅人'}</span>
                        </div>
                        <p className={`mt-0.5 ${inv.is_hidden ? 'line-through text-red-400' : 'text-zinc-200'}`}>
                          {inv.message || '(無留言)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleHideMessage(inv.id, inv.is_hidden)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                          inv.is_hidden
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                        }`}
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>{inv.is_hidden ? '復原顯示' : '剔除隱藏'}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-amber-200 block mb-1">
                管理團隊官方祝福 <span className="text-zinc-500 font-normal">(留空將帶入標準溫暖祝福)</span>
              </label>
              <textarea
                rows={2}
                value={adminBlessing}
                onChange={(e) => setAdminBlessing(e.target.value)}
                placeholder="夢沙星空見證了這份純粹的善意，願這份溫暖伴隨你迎向嶄新的明天！"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-emerald-400/50"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShippingStory(null)} className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer">
                取消
              </button>
              <button
                onClick={handleConfirmShipment}
                disabled={shippingSubmit}
                className="flex-1 py-2.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer"
              >
                {shippingSubmit ? '結算並出貨中...' : '確認完成出貨 (結算永久榮譽點數)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 3. 用戶管理 (Ban) =====
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

  const handleToggleBan = async (user: any) => {
    const isBanned = user.role === 'banned';
    const newRole = isBanned ? 'user' : 'banned';
    const actionText = isBanned ? '解除停權' : '永久停權 (Ban)';

    if (!confirm(`確定要將用戶「${user.anonymous_nickname || user.id}」${actionText} 嗎？`)) return;

    await supabase.from('users').update({ role: newRole }).eq('id', user.id);
    loadUsers();
  };

  if (loading) return <div className="text-center py-16 text-zinc-500 text-xs">載入星旅人名冊中...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
        <Users className="w-4 h-4 text-amber-400" /> 星旅人名冊與停權安全管制
      </h2>
      <p className="text-xs text-zinc-400">管理註冊者權限，停權者將被限制發布與互動功能。</p>

      <div className="space-y-2.5">
        {users.map((u) => (
          <div key={u.id} className="glass rounded-xl p-4 flex items-center justify-between border border-white/5 bg-zinc-900/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-100 text-xs">{u.anonymous_nickname || '匿名星旅人'}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  u.role === 'admin' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30' :
                  u.role === 'banned' ? 'bg-zinc-800 text-red-400 font-black' : 'bg-emerald-500/10 text-emerald-300'
                }`}>
                  {u.role === 'admin' ? <><Shield className="w-2.5 h-2.5" /> 管理員</> : u.role === 'banned' ? <><Ban className="w-2.5 h-2.5" /> 已停權</> : '一般用戶'}
                </span>
                {u.is_phone_verified && <span className="text-[10px] text-emerald-400 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> 信箱已驗證</span>}
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-1">ID: {u.id} · 永久榮譽: {u.wallet_balance || 0} 星塵</p>
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
                {u.role === 'banned' ? '解鎖還原' : '封鎖停權'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 4. 公告部署 =====
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data as Announcement[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return alert('請填寫標題與內容');
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('announcements').insert({
        title: title.trim(),
        body: body.trim(),
        is_active: true,
      });

      if (error) throw error;
      alert('公告部署成功！');
      setTitle('');
      setBody('');
      loadAnnouncements();
    } catch (err: any) {
      alert(`發布失敗: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (ann: Announcement) => {
    try {
      await supabase
        .from('announcements')
        .update({ is_active: !ann.is_active })
        .eq('id', ann.id);

      setAnnouncements((prev) =>
        prev.map((item) => (item.id === ann.id ? { ...item, is_active: !ann.is_active } : item))
      );
    } catch (err: any) {
      alert(`狀態切換失敗: ${err.message}`);
    }
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditBody(ann.body);
  };

  const handleSaveEdit = async () => {
    if (!editingAnn) return;
    if (!editTitle.trim() || !editBody.trim()) return alert('請完整填寫標題與內容');
    setIsSavingEdit(true);
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          title: editTitle.trim(),
          body: editBody.trim(),
        })
        .eq('id', editingAnn.id);

      if (error) throw error;
      alert('公告更新成功！');
      setEditingAnn(null);
      loadAnnouncements();
    } catch (err: any) {
      alert(`更新失敗: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要永久刪除此則公告嗎？此動作無法復原。')) return;
    try {
      await supabase.from('announcements').delete().eq('id', id);
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-300" /> 全站廣播公告部署管理
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          在此發布的公告將即時進入首頁頂部星空廣播站進行平滑輪播。
        </p>
      </div>

      <form
        onSubmit={handlePublish}
        className="glass rounded-2xl p-5 space-y-3.5 bg-zinc-900/60 border border-amber-400/20"
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
            placeholder="例如：平台正式開啟星空守護功能"
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
            required
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">公告內文說明</label>
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
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs">載入公告清單中...</div>
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
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ann.is_active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-white/10'
                    }`}
                  >
                    {ann.is_active ? '輪播啟用中' : '已停用'}
                  </span>
                  <h4 className="font-bold text-amber-100 text-xs">{ann.title}</h4>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{ann.body}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(ann)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 border border-white/10 text-zinc-300 hover:bg-zinc-700 cursor-pointer"
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
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setEditingAnn(null)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-lg p-6 glow-border border-amber-400/30 bg-zinc-950 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" /> 編輯公告內容
              </h3>
              <button onClick={() => setEditingAnn(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">公告主標題</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">公告內文說明</label>
              <textarea
                rows={3}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 resize-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAnn(null)}
                className="flex-1 py-2 text-xs border border-white/10 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className="flex-1 py-2 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認並儲存修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 5. Tag 管理 =====
function TagsTab() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTags = useCallback(async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setTags(data as TagType[]);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim().replace(/^#/, '');
    if (!cleanName) return alert('請輸入標籤名稱');

    setSubmitting(true);
    try {
      const maxSort = tags.length > 0 ? Math.max(...tags.map((t) => t.sort_order || 0)) : 0;
      const { error } = await supabase.from('tags').insert({
        name: cleanName,
        icon: '#',
        sort_order: maxSort + 1,
      });

      if (error) throw error;

      alert(`標籤 #${cleanName} 新增成功！`);
      setName('');
      await loadTags();
    } catch (err: any) {
      alert(`新增失敗: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!confirm(`確定要刪除標籤 #${tagName} 嗎？`)) return;
    try {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
      await loadTags();
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-300" /> 分類標籤管理
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          在此新增或移除的標籤將即時同步於前台篩選列與許願選單。
        </p>
      </div>

      <form onSubmit={handleAdd} className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center bg-zinc-900/60 border border-amber-400/20">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="標籤名稱 (例如：數位創作)"
          className="flex-1 min-w-[200px] bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {submitting ? '新增中...' : '+ 新增分類標籤'}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {tags.map((t) => (
          <div key={t.id} className="glass rounded-xl p-3 flex justify-between items-center text-xs border border-white/5 bg-zinc-900/40">
            <span className="text-amber-200 font-mono font-medium">
              #{t.name}
            </span>
            <button
              onClick={() => handleDelete(t.id, t.name)}
              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}