import { useState } from 'react';
import { Sparkles, Compass } from 'lucide-react';

// 👑 完美的預設狀態：將卡片陣列完全清空 (零卡片)
const staticWishes: any[] = [];

export function HomePage() {
  const [activeTag, setActiveTag] = useState('全部故事');
  const tags = ['全部故事', '#學生苦讀中', '#面試大作戰', '#毛孩的願望', '#生日邊緣人'];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-32 relative z-10">
      
      {/* 1. 主標題區 */}
      <header className="max-w-4xl mx-auto text-center my-12 px-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1 text-xs text-amber-400 font-medium mb-6 shadow-sm">
          <span>✨</span> 聽見世界的微小願望
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          用陌生人的善意，拼湊夢想的沙漏
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          這裡不看名氣，只聽故事。投入微小的星塵碎片，當沙漏填滿時，漂流瓶留言將與夢想一同解鎖。
        </p>
      </header>

      {/* 2. 動態篩選標籤列 */}
      <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-none mb-12 border-b border-slate-800/50">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-300 cursor-pointer ${
              activeTag === tag
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 3. 核心功能：當資料庫全空時，強制啟動「溫暖的防禦性留空畫面」 */}
      {staticWishes.length === 0 ? (
        <div className="max-w-md mx-auto my-16 text-center border border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-2xl p-10 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-amber-500/5 border border-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-amber-400 animate-pulse">
            ⏳
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">
            夜空有些寂靜，沙漏正等待星塵
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto mb-6">
            目前全站尚未有陌生人拋下故事。點擊網頁右上角的個人大頭貼進入休息室，成為這片星空下的第一個築夢者吧！
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400/60 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
            <Compass className="w-3.5 h-3.5" />
            <span>初登場 · 系統狀態健全</span>
          </div>
        </div>
      ) : (
        // 如果未來有卡片，會在這裡正常渲染（目前預設為空，所以會自動跳過此區塊）
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* 卡片渲染區 */}
        </div>
      )}

    </div>
  );
}
