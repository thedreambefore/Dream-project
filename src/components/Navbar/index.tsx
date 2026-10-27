// src/components/Navbar/index.tsx
import { BrandLogo } from '@/components/BrandLogo';
import { Shield, Sparkles, Hourglass } from 'lucide-react';
import { useNavbar } from './useNavbar';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
}

export function Navbar({ onOpenAuth, onOpenDashboard, onOpenAdmin }: NavbarProps) {
  const nav = useNavbar();

  if (nav.loading) {
    return (
      <header className="w-full h-16 bg-zinc-950 border-b border-white/5 sticky top-0 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-600"><Hourglass className="w-4 h-4 animate-spin" /><span>夢沙 DreamSand...</span></div>
      </header>
    );
  }

  return (
    <header className="w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer"><BrandLogo /></div>

        <div className="flex items-center gap-4">
          {nav.profile?.role === 'admin' && (
            <button onClick={onOpenAdmin} className="touch-btn bg-red-950/50 border border-red-500/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer">
              <Shield className="w-3.5 h-3.5 text-red-400" /><span>管理總後台</span>
            </button>
          )}

          {nav.session ? (
            <div className="flex items-center gap-4">
              <div onClick={onOpenDashboard} className="flex items-center gap-3 cursor-pointer group bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl hover:bg-white/10 transition-all select-none">
                <div className="text-right">
                  <p className="text-zinc-200 text-sm font-medium group-hover:text-amber-300 transition-colors">{nav.profile?.anonymous_nickname?.trim() || '匿名星旅人'}</p>
                  <p className="text-amber-400 text-xs font-mono flex items-center justify-end gap-1"><Sparkles className="w-3 h-3 text-amber-400" /><span>{nav.profile?.wallet_balance ?? 0} 星塵</span></p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border border-amber-300/30 flex items-center justify-center text-gray-900 font-bold text-xs">{nav.profile?.anonymous_nickname?.substring(0, 1) || '星'}</div>
              </div>
              <button onClick={nav.handleLogoutClick} className="text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer">登出</button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg">
              <Sparkles className="w-4 h-4 fill-current" /><span>點燃星塵</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;