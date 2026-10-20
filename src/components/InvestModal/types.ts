import type { Wish } from '@/types/wish';

export type PaymentMethod = 'ecpay' | 'linepay';

export interface InvestModalProps {
  story: Wish;
  onClose: (addedAmount?: number) => void;
}