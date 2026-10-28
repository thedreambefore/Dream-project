// src/pages/UserDashboard/components/PublishTab/index.tsx
import { Sparkles, Loader2 } from 'lucide-react';
import { usePublish } from './usePublish';
import { PublishSuccessCard } from './components/PublishSuccessCard';
import { PublishForm } from './components/PublishForm';
import { PublishConstraintBanner } from './components/PublishConstraintBanner';

export function PublishTab({ onRequireVerify, onSwitchToMyWishes }: { onRequireVerify: () => void; onSwitchToMyWishes?: () => void }) {
  const p = usePublish(onRequireVerify);

  if (p.isCheckingConstraint) {
    return <div className="py-20 text-center text-xs text-zinc-500 flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-amber-300" />正在確認星旅人心願排隊狀態...</div>;
  }

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" /> 發布主題心願活動</h2>
      {p.publishBlockedReason ? (
        <PublishConstraintBanner reason={p.publishBlockedReason} blockingWish={p.blockingWish} onSwitchToMyWishes={onSwitchToMyWishes} />
      ) : p.success ? (
        <PublishSuccessCard onReset={() => p.setSuccess(false)} />
      ) : (
        <PublishForm
          title={p.title} setTitle={p.setTitle} story={p.story} setStory={p.setStory} promise={p.promise} setPromise={p.setPromise}
          basePrice={p.basePrice} setBasePrice={p.setBasePrice} hasShippingFee={p.hasShippingFee} setHasShippingFee={p.setHasShippingFee}
          finalPrice={p.finalPrice} productUrl={p.productUrl} setProductUrl={p.setProductUrl} tags={p.tags} tagName={p.tagName} setTagName={p.setTagName}
          coverEmoji={p.coverEmoji} setCoverEmoji={p.setCoverEmoji} imageBase64={p.imageBase64} setImageBase64={p.setImageBase64}
          compressing={p.compressing} submitting={p.submitting} error={p.error} onImageChange={p.handleImageChange} onSubmit={p.handlePublishClick}
        />
      )}
    </div>
  );
}

export default PublishTab;