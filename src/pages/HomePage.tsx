import { useState, useMemo } from 'react';
import { Megaphone, Search, Sparkles } from 'lucide-react';
import { usePublicData } from '@/hooks/usePublicData';
import { StoryCard } from '@/components/StoryCard';

export function HomePage() {
  const { stories, tags, announcement, loading } = usePublicData();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = useMemo(() => {
    let result = stories;
    if (activeTag) {
      result = result.filter((s) => s.tag_name === activeTag);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.product_name.toLowerCase().includes(q) ||
          s.story_text.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stories, activeTag, searchQuery]);

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Announcement banner */}
      {announcement && (
        <button
          onClick={() => setShowAnnouncement(true)}
          className="w-full glass rounded-2xl px-4 py-3 flex items-center gap-3 glow-border hover:glow-gold transition-all text-left"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-200 truncate">{announcement.title}</p>
            <p className="text-xs text-gray-400 truncate">{announcement.body}</p>
          </div>
          <span className="text-xs text-amber-400 flex-shrink-0">查看詳情 →</span>
        </button>
      )}

      {/* Hero section */}
      <div className="text-center py-6 sm:py-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span className="text-sm text-amber-300/80 tracking-wider">匿名星塵願望交易所</span>
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-amber-100 glow-text mb-3">
          讓星光照亮每個願望
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
          在這裡，每個願望都是一顆等待被點亮的星塵。匿名寫下你的困境故事，讓群眾的溫暖 化作真實的禮物送到你手中。
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜尋願望故事..."
          className="w-full bg-white/5 border border-white/10 rounded-full pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/40 transition-all text-sm"
        />
      </div>

      {/* Tag filter bar */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        <button
          onClick={() => setActiveTag(null)}
          className={`tag-chip touch-btn flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
            activeTag === null
              ? 'tag-chip-active'
              : 'glass border-white/10 text-gray-300 hover:border-amber-400/30'
          }`}
        >
          <span>🌟</span>
          <span className="text-sm font-medium">全部</span>
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => setActiveTag(tag.name)}
            className={`tag-chip touch-btn flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
              activeTag === tag.name
                ? 'tag-chip-active'
                : 'glass border-white/10 text-gray-300 hover:border-amber-400/30'
            }`}
          >
            <span>{tag.icon}</span>
            <span className="text-sm font-medium">{tag.name}</span>
          </button>
        ))}
      </div>

      {/* Story grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌌</div>
          <p className="text-gray-400">此分類目前沒有願望故事</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStories.map((story, i) => (
            <StoryCard key={story.id} story={story} index={i} />
          ))}
        </div>
      )}

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
    </div>
  );
}
