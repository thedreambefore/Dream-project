// src/pages/UserDashboard/components/WalletTab/components/InTransitDetailsList.tsx
import { FileText, MessageSquare } from 'lucide-react';
import type { TransitItem } from '../../../types';

export function InTransitDetailsList({ transitList }: { transitList: TransitItem[] }) {
  return (
    <div className="glass rounded-2xl p-5 border border-amber-400/30 bg-zinc-950/90 space-y-3 animate-fade-in">
      <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
        <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-300" /> 我的在途星塵來歷名冊 ({transitList.length} 筆)
        </h4>
        <span className="text-[10px] text-zinc-500">活動贈禮送達後將轉為永久榮譽</span>
      </div>

      {transitList.length === 0 ? (
        <div className="text-center py-6 text-xs text-zinc-500">目前尚無在途的星塵投入。</div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
          {transitList.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/20 transition-all text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-100 truncate max-w-[240px]">{item.wish?.product_name || '心願活動'}</span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/20">+{item.amount} 顆在途中</span>
              </div>
              <p className="text-zinc-300 bg-black/40 p-2 rounded-lg text-[11px] leading-relaxed">
                <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />留言：{item.message || '(默默守護未留字)'}
              </p>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
                <span>當前進度：{item.wish?.current_stardust}/{item.wish?.product_price} ({item.wish?.status === 'full_funded' ? '🎉 已達標排定贈禮寄送' : '集星推進中'})</span>
                <span>{new Date(item.created_at).toLocaleDateString('zh-TW')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}