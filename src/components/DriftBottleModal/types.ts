// src/components/DriftBottleModal/types.ts
import type { Wish, Investment } from '@/types/wish';

export interface DriftBottleModalProps {
  wish: Wish;
  progress: number;
  isFulfilled: boolean;
  onClose: () => void;
}

export interface UserContributionStat {
  total: number;
  percent: number;
}