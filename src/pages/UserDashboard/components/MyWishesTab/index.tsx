// src/pages/UserDashboard/components/MyWishesTab/index.tsx
import { Sparkles } from 'lucide-react';
import { WishCard } from '@/components/WishCard';
import { useMyWishes } from './useMyWishes';
import { TaxComplianceBanner } from './components/TaxComplianceBanner';
import { MyWishesFilterBar } from './components/MyWishesFilterBar';
import { MyWishesModals } from './components/MyWishesModals';

export function MyWishesTab({ onSwitchToAccount }: { onSwitchToAccount?: () => void }) {
  const m = useMyWishes();

  if (m.loading) return <div className="text-center py-16 text-zinc-500 text-xs">正在探尋您的星願紀錄...</div>;

  return (
    <div className="max-w-4xl space-y-5 animate-fade-in">
      {m.taxDeclarationWish && <TaxComplianceBanner targetWish={m.taxDeclarationWish} onGoToAccount={onSwitchToAccount} />}

      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" /> 我的心願追蹤館</h2>
        <MyWishesFilterBar filterTag={m.filterTag} onSelectFilter={m.setFilterTag} />
      </div>

      {m.filteredList.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500 text-xs">此分類下目前無心願。</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {m.filteredList.map((w, idx) => (
            <WishCard key={w.id} wish={w} index={idx} variant="myWishes" onOpenLetterModal={m.handleOpenLetterModal} onOpenEditModal={m.handleStartEdit} />
          ))}
        </div>
      )}

      <MyWishesModals
        editingWish={m.editingWish} editTitle={m.editTitle} setEditTitle={m.setEditTitle} editPrice={m.editPrice} setEditPrice={m.setEditPrice}
        editProductUrl={m.editProductUrl} setEditProductUrl={m.setEditProductUrl} editStory={m.editStory} setEditStory={m.setEditStory}
        editPromise={m.editPromise} setEditPromise={m.setEditPromise} savingEdit={m.savingEdit} onCloseEdit={() => m.setEditingWish(null)} onSubmitEdit={m.handleResubmit}
        letterWish={m.letterWish} thankYouLetter={m.thankYouLetter} setThankYouLetter={m.setThankYouLetter} unboxingPhoto={m.unboxingPhoto}
        setUnboxingPhoto={m.setUnboxingPhoto} compressingPhoto={m.compressingPhoto} savingLetter={m.savingLetter} onPhotoUpload={m.handlePhotoUpload}
        onCloseLetter={() => m.setLetterWish(null)} onSubmitLetter={m.handleSubmitLetter}
      />
    </div>
  );
}

export default MyWishesTab;