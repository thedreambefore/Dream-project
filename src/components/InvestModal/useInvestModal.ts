// src/components/InvestModal/useInvestModal.ts
import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import {
  calculateServiceFee,
  executeStarInvestment,
  type FeeCalculation,
} from '@/services/investmentService';
import type { Wish } from '@/types/wish';
import type { PaymentMethod } from './types';

export function useInvestModal(story: Wish, onClose: (addedAmount?: number) => void) {
  const { session, profile, refreshProfile } = useAuth();
  const isOfficial = story.id === OFFICIAL_SPONSOR_ID;

  const currentStardust = Number(story.current_stardust || 0);
  const targetPrice = Number(story.product_price || 0);
  const remainingNeed = isOfficial ? 999999 : Math.max(0, targetPrice - currentStardust);

  const [amount, setAmount] = useState<number>(50);
  const [customInput, setCustomInput] = useState<string>('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ecpay');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successPaidAmount, setSuccessPaidAmount] = useState<number | null>(null);

  // 🌟 付款前信箱強驗證彈窗開關
  const [showEmailVerify, setShowEmailVerify] = useState(false);

  const feeDetails: FeeCalculation = useMemo(() => {
    return calculateServiceFee(amount, isOfficial);
  }, [amount, isOfficial]);

  const handleSelectPreset = useCallback((val: number) => {
    setAmount(val);
    setCustomInput('');
    setError('');
  }, []);

  const handleCustomChange = useCallback((val: string) => {
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
      setError('');
    } else {
      setAmount(0);
    }
  }, []);

  const handleCheckout = useCallback(async () => {
    setError('');

    if (!session?.user?.id) {
      alert('請先登入後再投下虛擬星星！');
      return;
    }

    // 🌟 核心防線：未驗證信箱者，禁止付款並立刻觸發認證視窗
    if (!profile?.is_phone_verified) {
      setShowEmailVerify(true);
      return;
    }

    if (amount < 50 && !isOfficial) {
      setError('單次投下虛擬星星最低金額為 NT$ 50 元');
      return;
    }
    if (!agreeTerms) {
      setError('請勾選並確認數位內容服務條款');
      return;
    }
    if (message.length > 50) {
      setError('互動留言不得超過 50 字');
      return;
    }

    setLoading(true);
    try {
      const payAmount = Number(amount);

      await executeStarInvestment({
        userId: session.user.id,
        story,
        amount: payAmount,
        message,
      });

      setSuccessPaidAmount(payAmount);
      refreshProfile();

      setTimeout(() => {
        onClose(payAmount);
      }, 1400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '金流連線異常，請稍後重試');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, profile?.is_phone_verified, amount, isOfficial, agreeTerms, message, story, refreshProfile, onClose]);

  return {
    isOfficial,
    currentStardust,
    targetPrice,
    remainingNeed,
    amount,
    customInput,
    message,
    setMessage,
    paymentMethod,
    setPaymentMethod,
    agreeTerms,
    setAgreeTerms,
    loading,
    error,
    successPaidAmount,
    showEmailVerify,
    setShowEmailVerify,
    feeDetails,
    handleSelectPreset,
    handleCustomChange,
    handleCheckout,
  };
}