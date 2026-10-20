import { BrandLogo } from '@/components/BrandLogo';
import { Shield, LogOut, X } from 'lucide-react';

interface Props {
  onGoHome: () => void;
  onClose: () => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  isAdmin: boolean;
}

export function DashboardHeader({ onGoHome, onClose, onLogout, onOpenAdmin, isAdmin }: Props) {
  return (
    <header className="sticky top-0 z-10 glass-strong border-b border-amber-400/10 px-4 sm:px-6 h-16 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
      <button onClick={onGoHome} className="hover:opacity-80 transition-opacity cursor-pointer">
        <BrandLogo />
      </button>
      <div className="flex items-center gap-3">
        {isAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span>管理後台</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> <span>登出</span>
        </button>
        <button
          onClick={onClose}
          className="rounded-full hover:bg-white/10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}