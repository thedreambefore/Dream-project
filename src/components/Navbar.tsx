import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronRight, Bell, Megaphone, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Announcement } from '@/lib/supabase';

export function Navbar({
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  announcement,
}: {
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  announcement: Announcement | null;
}) {
  const { session, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 glass-strong border-b border-amber-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo — always links to home */}
          <button
            onClick={() => { setMenuOpen(false); setUserMenuOpen(false); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">⏳</span>
            <div>
              <span className="text-lg font-bold text-amber-100 glow-text">夢沙</span>
              <span className="text-sm text-gray-400 ml-1 hidden sm:inline">DreamSand</span>
            </div>
          </button>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-3">
            {announcement && (
              <button
                onClick={() => setShowAnnouncement(true)}
                className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-amber-200 transition-colors max-w-xs truncate"
              >
                <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="truncate">{announcement.title}</span>
              </button>
            )}

            {profile?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="text-sm px-3 py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition-all touch-btn font-bold pulse-gold"
              >
                🛠️ 進入管理總後台
              </button>
            )}

            {session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="touch-btn flex items-center gap-2 glass rounded-full px-3 py-1.5 hover:glow-gold transition-all"
                >
                  <span className="text-xl">{profile?.avatar_emoji || '🌙'}</span>
                  <span className="text-sm text-amber-100">{profile?.display_name || '星旅人'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl p-2 glow-border scale-in origin-top-right z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-xs text-gray-500">已登入帳號</p>
                      <p className="text-sm text-amber-100 truncate">{session.user?.email}</p>
                      {(profile?.is_phone_verified || profile?.phone_verified) && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 border border-green-400/30 text-green-300">
                          手機已驗證
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => { onOpenDashboard(); setUserMenuOpen(false); }}
                      className="w-full touch-btn flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-amber-200 transition-all text-sm text-left"
                    >
                      <User className="w-4 h-4" />
                      個人後台
                    </button>
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => { onOpenAdmin(); setUserMenuOpen(false); }}
                        className="w-full touch-btn flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-200 transition-all text-sm text-left font-bold pulse-gold"
                      >
                        🛠️ 進入管理總後台
                      </button>
                    )}
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full touch-btn flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-300 transition-all text-sm text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        登出
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl px-5 py-2.5 hover:from-amber-400 hover:to-yellow-500 transition-all text-sm"
              >
                註冊 / 登入
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden touch-btn rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-300"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden glass-strong border-t border-white/10 px-4 py-4 space-y-3 scale-in">
            {announcement && (
              <button
                onClick={() => { setShowAnnouncement(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              >
                <Megaphone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate">{announcement.title}</span>
              </button>
            )}
            {profile?.role === 'admin' && (
              <button
                onClick={() => { onOpenAdmin(); setMenuOpen(false); }}
                className="w-full touch-btn text-sm px-4 py-3 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-left font-bold pulse-gold"
              >
                🛠️ 進入管理總後台
              </button>
            )}
            {session ? (
              <>
                <button
                  onClick={() => { onOpenDashboard(); setMenuOpen(false); }}
                  className="w-full touch-btn flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                >
                  <span className="text-xl">{profile?.avatar_emoji || '🌙'}</span>
                  <span className="text-sm text-amber-100">{profile?.display_name || '星旅人'}</span>
                  <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                </button>
                <div className="text-xs text-gray-500 px-3 truncate">{session.user?.email}</div>
                <button
                  onClick={handleSignOut}
                  className="w-full touch-btn flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMenuOpen(false); }}
                className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3"
              >
                註冊 / 登入
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Announcement detail modal */}
      {showAnnouncement && announcement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm scale-in"
          onClick={() => setShowAnnouncement(false)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-md p-6 glow-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-5 h-5 text-amber-300" />
              <h2 className="text-lg font-bold text-amber-100">{announcement.title}</h2>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{announcement.body}</p>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="w-full touch-btn mt-6 bg-amber-500/15 border border-amber-400/30 text-amber-200 rounded-xl py-3 hover:bg-amber-500/25 transition-all"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}
