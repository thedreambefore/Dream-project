import { useState, useEffect } from 'react';
import { X, Coins, Send, Loader2, Heart } from 'lucide-react';
import { supabase, type Story } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { updateWish } from '@/lib/backend';

export function InvestModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const { session, profile } = useAuth();
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      supabase
        .from('wallets')
        .select('available_stardust')
        .eq('user_id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setWalletBalance(data.available_stardust);
        });
    }
  }, [session]);

  const handleInvest = async () => {
    setError('');
    if (!session?.user) {
      setShowAuth(true);
      return;
    }
    if (amount <= 0) {
      setError('注入金額需大於 0');
      return;
    }
    if (walletBalance !== null && amount > walletBalance) {
      setError(`星塵餘額不足（可用：${walletBalance}）`);
      return;
    }
    if (message.length > 50) {
      setError('留言不得超過 50 字');
      return;
    }

    setLoading(true);
    try {
      const { error: investError } = await supabase
        .from('investments')
        .insert({
          story_id: story.id,
          amount,
          message: message || null,
          is_anonymous: true,
        });
      if (investError) throw investError;

      const newTotal = story.current_stardust + amount;
      const newStatus = newTotal >= story.product_price ? 'fulfilled' : 'approved';
      await updateWish(story.id, { current_stardust: newTotal, status: newStatus });

      if (walletBalance !== null && session?.user?.id) {
        await supabase
          .from('wallets')
          .update({
            available_stardust: walletBalance - amount,
            in_transit_stardust: 0,
          })
          .eq('user_id', session.user.id);
      }

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch {
      setError('注入失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm scale-in"
        onClick={onClose}
      >
        <div
          className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-8 glow-border"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <div className="text-center py-8 scale-in">
              <div className="text-5xl mb-4 hourglass-anim inline-block">⏳</div>
              <h3 className="text-xl font-bold text-amber-200 mb-2">星塵已注入！</h3>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
                <Heart className="w-4 h-4 text-amber-400" />
                你的溫暖已化作星光照亮這個願望
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-amber-100">漂流瓶留言</h2>
                <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hourglass animation */}
              <div className="text-center mb-5">
                <div className="text-5xl hourglass-anim inline-block">⏳</div>
                <p className="text-xs text-gray-500 mt-2">對外匿名 · 你的身分不會被揭露</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-100 font-bold mb-1">{story.product_name}</p>
                  <p className="text-xs text-gray-400">
                    目前 {story.current_stardust.toLocaleString()} / {story.product_price.toLocaleString()} 星塵
                  </p>
                </div>

                {session?.user && walletBalance !== null && (
                  <p className="text-xs text-gray-400">
                    可用星塵：<span className="text-amber-300 font-bold">{walletBalance.toLocaleString()}</span>
                  </p>
                )}

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">注入星塵金額</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 500, 1000].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAmount(v)}
                        className="flex-1 touch-btn text-xs bg-white/5 border border-white/10 rounded-lg py-1.5 text-gray-300 hover:border-amber-400/30 hover:text-amber-200 transition-all"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1.5">
                    星光留言 <span className="text-gray-500">(50 字內)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="留下一句溫暖的話..."
                    maxLength={50}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none text-sm"
                  />
                  <p className="text-right text-xs text-gray-600 mt-1">{message.length}/50</p>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  onClick={handleInvest}
                  disabled={loading}
                  className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3.5 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {session?.user ? '投入漂流瓶' : '請先登入後注入'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
