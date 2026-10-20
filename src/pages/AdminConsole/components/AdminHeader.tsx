import { BrandLogo } from '@/components/BrandLogo';
import { LogOut, X } from 'lucide-react';

interface Props {
  onGoHome: () => void;
  onClose: () => void;
  onLogout: () => void;
}

export function AdminHeader({ onGoHome, onClose, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-10 glass-strong border-b border-amber-400/10 px-4 sm:px-6 h-16 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
      <button
        onClick={onGoHome}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 cursor-pointer"
      >
        <BrandLogo />
        <span className="text-xs text-zinc-500 border-l border-white/10 pl-2 ml-1 hidden sm:inline">
          管理總後台
        </span>
      </button>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all text-xs font-bold cursor-pointer flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">登出管理員</span>
        </button>
        <button
          onClick={onClose}
          className="rounded-full hover:bg-white/10 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
        >
          <X className="w-5 h-5 flex-shrink-0" />
        </button>
      </div>
    </header>
  );
}