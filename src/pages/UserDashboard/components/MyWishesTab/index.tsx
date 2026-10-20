import { Sparkles, Hourglass, FileText, CheckCircle2, Ban } from 'lucide-react';
import { WishCard } from '@/components/WishCard';
import { useMyWishes, type MyWishesFilter } from './useMyWishes';
import { EditWishModal } from './EditWishModal';
import { LetterModal } from './LetterModal';

const FILTER_BUTTONS: { id: MyWishesFilter; label: string; icon: React.ComponentType<{ className?: string }> | null }[] = [
  { id: 'all', label: '全部', icon: null },
  { id: 'approved', label: '推進中', icon: Hourglass },
  { id: 'pending', label: '審核中', icon: FileText },
  { id: 'fulfilled', label: '已達成', icon: CheckCircle2 },
  { id: 'blocked', label: '已駁回', icon: Ban },
];

export function MyWishesTab() {
  const {
    filteredList,
    filterTag,
    setFilterTag,
    loading,
    editingWish,
    setEditingWish,
    editTitle,
    setEditTitle,
    editPrice,
    setEditPrice,
    editProductUrl,
    setEditProductUrl,
    editStory,
    setEditStory,
    editPromise,
    setEditPromise,
    savingEdit,
    handleStartEdit,
    handleResubmit,
    letterWish,
    setLetterWish,
    thankYouLetter,
    setThankYouLetter,
    unboxingPhoto,
    setUnboxingPhoto,
    compressingPhoto,
    savingLetter,
    handleOpenLetterModal,
    handlePhotoUpload,
    handleSubmitLetter,
  } = useMyWishes();

  if (loading) {
    return <div className="text-center py-16 text-zinc-500">正在探尋您的星願紀錄...</div>;
  }

  return (
    <div className="max-w-4xl space-y-5 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" /> 我的心願追蹤館
        </h2>

        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl text-xs gap-1 overflow-x-auto hide-scrollbar">
          {FILTER_BUTTONS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = filterTag === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTag(tab.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {TabIcon && <TabIcon className="w-3 h-3" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500">
          此分類下目前無心願。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((w, idx) => (
            <WishCard
              key={w.id}
              wish={w}
              index={idx}
              variant="myWishes"
              onOpenLetterModal={handleOpenLetterModal}
              onOpenEditModal={handleStartEdit}
            />
          ))}
        </div>
      )}

      {editingWish && (
        <EditWishModal
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editPrice={editPrice}
          setEditPrice={setEditPrice}
          editProductUrl={editProductUrl}
          setEditProductUrl={setEditProductUrl}
          editStory={editStory}
          setEditStory={setEditStory}
          editPromise={editPromise}
          setEditPromise={setEditPromise}
          savingEdit={savingEdit}
          onClose={() => setEditingWish(null)}
          onSubmit={handleResubmit}
        />
      )}

      {letterWish && (
        <LetterModal
          thankYouLetter={thankYouLetter}
          setThankYouLetter={setThankYouLetter}
          unboxingPhoto={unboxingPhoto}
          setUnboxingPhoto={setUnboxingPhoto}
          compressingPhoto={compressingPhoto}
          savingLetter={savingLetter}
          onPhotoUpload={handlePhotoUpload}
          onClose={() => setLetterWish(null)}
          onSubmit={handleSubmitLetter}
        />
      )}
    </div>
  );
}