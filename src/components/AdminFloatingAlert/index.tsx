// src/components/AdminFloatingAlert/index.tsx
import { AlertCircle } from 'lucide-react';
import { useAdminFloatingAlert } from './useAdminFloatingAlert';
import type { AdminTab } from '@/pages/AdminConsole/types';

export function AdminFloatingAlert({ onOpenAdminWithTab }: { onOpenAdminWithTab: (tab: AdminTab) => void }) {
  const { isVisible, label, colorStyles, handleClick } = useAdminFloatingAlert(onOpenAdminWithTab);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="管理員審核待辦提醒"
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-[9990] flex items-center gap-2 px-3.5 py-2.5 rounded-full border backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-105 shadow-xl animate-bounce ${colorStyles}`}
      title="點擊前往管理後台處理審核項目"
    >
      <AlertCircle className="w-4 h-4 animate-pulse flex-shrink-0" />
      <span className="text-xs font-bold whitespace-nowrap">{label}</span>
    </aside>
  );
}

export default AdminFloatingAlert;