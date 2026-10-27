// src/pages/UserDashboard/components/MyWishesTab/components/MyWishesModals.tsx
import { EditWishModal } from '../EditWishModal';
import { LetterModal } from '../LetterModal';
import type { Wish } from '@/types/wish';

interface Props {
  editingWish: Wish | null;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editPrice: number;
  setEditPrice: (v: number) => void;
  editProductUrl: string;
  setEditProductUrl: (v: string) => void;
  editStory: string;
  setEditStory: (v: string) => void;
  editPromise: string;
  setEditPromise: (v: string) => void;
  savingEdit: boolean;
  onCloseEdit: () => void;
  onSubmitEdit: () => void;
  letterWish: Wish | null;
  thankYouLetter: string;
  setThankYouLetter: (v: string) => void;
  unboxingPhoto: string | null;
  setUnboxingPhoto: (v: string | null) => void;
  compressingPhoto: boolean;
  savingLetter: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCloseLetter: () => void;
  onSubmitLetter: () => void;
}

export function MyWishesModals(props: Props) {
  return (
    <>
      {props.editingWish && (
        <EditWishModal
          editTitle={props.editTitle} setEditTitle={props.setEditTitle}
          editPrice={props.editPrice} setEditPrice={props.setEditPrice}
          editProductUrl={props.editProductUrl} setEditProductUrl={props.setEditProductUrl}
          editStory={props.editStory} setEditStory={props.setEditStory}
          editPromise={props.editPromise} setEditPromise={props.setEditPromise}
          savingEdit={props.savingEdit} onClose={props.onCloseEdit} onSubmit={props.onSubmitEdit}
        />
      )}

      {props.letterWish && (
        <LetterModal
          thankYouLetter={props.thankYouLetter} setThankYouLetter={props.setThankYouLetter}
          unboxingPhoto={props.unboxingPhoto} setUnboxingPhoto={props.setUnboxingPhoto}
          compressingPhoto={props.compressingPhoto} savingLetter={props.savingLetter}
          onPhotoUpload={props.onPhotoUpload} onClose={props.onCloseLetter} onSubmit={props.onSubmitLetter}
        />
      )}
    </>
  );
}