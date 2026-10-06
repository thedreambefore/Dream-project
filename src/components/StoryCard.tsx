import { useState } from 'react';
import { Coins, Sparkles } from 'lucide-react';
import type { Story } from '@/lib/supabase';
import { InvestModal } from './InvestModal';

export function StoryCard({ story, index }: { story: Story; index: number }) {
  const [showInvest, setShowInvest] = useState(false);

  const progress = Math.min(100, Math.round((story.current_stardust / story.product_price) * 100));
  const isNearComplete = progress >= 90 && progress < 100;
  const isFulfilled = story.status === 'fulfilled';

  return (
    <>
      <div className="story-card glass rounded-2xl overflow-hidden glow-border transition-all duration-300 hover:scale-[1.02] hover:glow-gold fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
        {/* Blurred cover */}
        <div className="relative h-36 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/30">
          <div className="blurred-cover absolute inset-0 flex items-center justify-center text-6xl">
            {story.cover_emoji}
          </div>
          <div className="relative text-5xl z-10 drop-shadow-lg">{story.cover_emoji}</div>
          <span className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full glass-strong text-amber-200">
            #{story.tag_name}
          </span>
          {isFulfilled && (
            <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full bg-green-500/30 border border-green-400/40 text-green-200 font-bold">
              已履約
            </span>
          )}
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-amber-100 text-base leading-tight line-clamp-1">{story.product_name}</h3>

          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{story.story_text}</p>

          {/* Promise */}
          <div className="bg-amber-500/5 border border-amber-400/10 rounded-lg px-3 py-2">
            <p className="text-xs text-amber-200/70 line-clamp-2">
              <span className="font-bold">終章承諾：</span>{story.promise_text}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {story.current_stardust.toLocaleString()} / {story.product_price.toLocaleString()}
              </span>
              <span className={`font-bold ${isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'}`}>
                {progress}%
              </span>
            </div>
            <div className="stardust-bar">
              <div className="stardust-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Invest button */}
          {isFulfilled ? (
            <div className="touch-btn flex items-center justify-center gap-2 bg-green-500/15 border border-green-400/30 text-green-300 rounded-xl py-2.5 font-bold text-sm">
              🎉 已圓夢履約
            </div>
          ) : (
            <button
              onClick={() => setShowInvest(true)}
              className={`touch-btn w-full rounded-xl py-2.5 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isNearComplete
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 pulse-gold'
                  : 'bg-amber-500/15 border border-amber-400/30 text-amber-200 hover:bg-amber-500/25'
              }`}
            >
              {isNearComplete ? (
                <>🌟 搶下尾刀</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  注入星塵
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showInvest && (
        <InvestModal
          story={story}
          onClose={() => setShowInvest(false)}
        />
      )}
    </>
  );
}
