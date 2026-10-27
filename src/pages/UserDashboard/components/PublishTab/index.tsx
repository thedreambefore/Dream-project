// src/pages/UserDashboard/components/PublishTab/index.tsx
import { Sparkles } from 'lucide-react';
import { usePublish } from './usePublish';
import { PublishSuccessCard } from './components/PublishSuccessCard';
import { PublishForm } from './components/PublishForm';

export function PublishTab({ onRequireVerify }: { onRequireVerify: () => void }) {
  const publish = usePublish(onRequireVerify);

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-300" /> 發布主題心願活動
      </h2>

      {publish.success ? (
        <PublishSuccessCard onReset={() => publish.setSuccess(false)} />
      ) : (
        <PublishForm
          title={publish.title} setTitle={publish.setTitle}
          story={publish.story} setStory={publish.setStory}
          promise={publish.promise} setPromise={publish.setPromise}
          basePrice={publish.basePrice} setBasePrice={publish.setBasePrice}
          hasShippingFee={publish.hasShippingFee} setHasShippingFee={publish.setHasShippingFee}
          finalPrice={publish.finalPrice} productUrl={publish.productUrl} setProductUrl={publish.setProductUrl}
          tags={publish.tags} tagName={publish.tagName} setTagName={publish.setTagName}
          coverEmoji={publish.coverEmoji} setCoverEmoji={publish.setCoverEmoji}
          imageBase64={publish.imageBase64} setImageBase64={publish.setImageBase64}
          compressing={publish.compressing} submitting={publish.submitting} error={publish.error}
          onImageChange={publish.handleImageChange} onSubmit={publish.handlePublishClick}
        />
      )}
    </div>
  );
}

export default PublishTab;