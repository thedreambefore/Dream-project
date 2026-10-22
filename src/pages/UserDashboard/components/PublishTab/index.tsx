// src/pages/UserDashboard/components/PublishTab/index.tsx
import { Sparkles } from 'lucide-react';
import { usePublish } from './usePublish';
import { PublishSuccessCard } from './components/PublishSuccessCard';
import { PublishForm } from './components/PublishForm';

export function PublishTab({ onRequireVerify }: { onRequireVerify: () => void }) {
  const {
    title, setTitle, story, setStory, promise, setPromise, productPrice, setProductPrice,
    productUrl, setProductUrl, tags, tagName, setTagName, coverEmoji, setCoverEmoji,
    imageBase64, setImageBase64, compressing, submitting, error, success, setSuccess,
    handleImageChange, handlePublishClick,
  } = usePublish(onRequireVerify);

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-300" /> 發布主題心願活動
      </h2>

      {success ? (
        <PublishSuccessCard onReset={() => setSuccess(false)} />
      ) : (
        <PublishForm
          title={title} setTitle={setTitle} story={story} setStory={setStory} promise={promise} setPromise={setPromise}
          productPrice={productPrice} setProductPrice={setProductPrice} productUrl={productUrl} setProductUrl={setProductUrl}
          tags={tags} tagName={tagName} setTagName={setTagName} coverEmoji={coverEmoji} setCoverEmoji={setCoverEmoji}
          imageBase64={imageBase64} setImageBase64={setImageBase64} compressing={compressing} submitting={submitting} error={error}
          onImageChange={handleImageChange} onSubmit={handlePublishClick}
        />
      )}
    </div>
  );
}

export default PublishTab;