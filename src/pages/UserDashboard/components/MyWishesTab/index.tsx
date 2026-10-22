// src/pages/UserDashboard/components/MyWishesTab/index.tsx
import { Sparkles } from 'lucide-react';
import { WishCard } from '@/components/WishCard';
import { useMyWishes } from './useMyWishes';
import { TaxComplianceBanner } from './components/TaxComplianceBanner';
import { MyWishesFilterBar } from './components/MyWishesFilterBar';
import { EditWishModal } from './EditWishModal';
import { LetterModal } from './LetterModal';

export function MyWishesTab({ onSwitchToAccount }: { onSwitchToAccount?: () => void }) {
  const {
    filteredList,
    filterTag,
    setFilterTag,
    taxDeclarationWish,
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

  if (loading) return <div className="text-center py-16 text-zinc-500">正在探尋您的星願紀錄...</div>;

  return (
    <div className="max-w-4xl space-y-5 animate-fade-in">
      {taxDeclarationWish && <TaxComplianceBanner targetWish={taxDeclarationWish} onGoToAccount={onSwitchToAccount} />}

      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" /> 我的心願追蹤館
        </h2>
        <MyWishesFilterBar filterTag={filterTag} onSelectFilter={setFilterTag} />
      </div>

      {filteredList.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500">此分類下目前無心願。</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((w, idx) => (
            <WishCard key={w.id} wish={w} index={idx} variant="myWishes" onOpenLetterModal={handleOpenLetterModal} onOpenEditModal={handleStartEdit} />
          ))}
        </div>
      )}

      {editingWish && (
        <EditWishModal
          editTitle={editTitle} setEditTitle={setEditTitle} editPrice={editPrice} setEditPrice={setEditPrice}
          editProductUrl={editProductUrl} setEditProductUrl={setEditProductUrl} editStory={editStory} setEditStory={setEditStory}
          editPromise={editPromise} setEditPromise={setEditPromise} savingEdit={savingEdit} onClose={() => setEditingWish(null)} onSubmit={handleResubmit}
        />
      )}

      {letterWish && (
        <LetterModal
          thankYouLetter={thankYouLetter} setThankYouLetter={setThankYouLetter} unboxingPhoto={unboxingPhoto}
          setUnboxingPhoto={setUnboxingPhoto} compressingPhoto={compressingPhoto} savingLetter={savingLetter}
          onPhotoUpload={handlePhotoUpload} onClose={() => setLetterWish(null)} onSubmit={handleSubmitLetter}
        />
      )}
    </div>
  );
}

export default MyWishesTab;