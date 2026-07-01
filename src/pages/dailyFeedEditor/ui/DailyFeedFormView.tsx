import { PageShell } from '@/app/layout';
import { useKeyboardVisible } from '@/shared/hooks/useKeyboardVisible';
import { Button, DailyQuestion, Header } from '@/shared/ui';
import { ContentTextarea, PhotoSlot } from '@/shared/ui/FeedForm';
import type { ReactNode } from 'react';

interface DailyFeedFormViewProps {
  questionText: string;
  title: string;
  submitLabel: string;
  submitDisabled: boolean;
  photoUrl: string | null;
  onAddPhoto: () => void;
  onRemovePhoto: () => void;
  content: string;
  onChangeContent: (value: string) => void;
  maxContentLength: number;
  onBack: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  loadingState?: ReactNode;
  footer?: ReactNode;
}

export const DailyFeedFormView = ({
  questionText,
  title,
  submitLabel,
  submitDisabled,
  photoUrl,
  onAddPhoto,
  onRemovePhoto,
  content,
  onChangeContent,
  maxContentLength,
  onBack,
  onSubmit,
  isLoading = false,
  loadingState = null,
  footer = null,
}: DailyFeedFormViewProps) => {
  const isKeyboardVisible = useKeyboardVisible();

  return (
    <PageShell
      header={<Header title={title} onBack={onBack} />}
      contentClassName="flex flex-col overflow-hidden"
      bottomClassName="px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))]"
      bottom={
        isKeyboardVisible ? null : (
          <Button
            variant="primary"
            disabled={submitDisabled}
            onClick={onSubmit}
            className="disabled:bg-gray-300 disabled:text-gray-400"
          >
            {submitLabel}
          </Button>
        )
      }
    >
      <DailyQuestion question={questionText} />

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-6 pb-8">
        {isLoading ? (
          loadingState
        ) : (
          <>
            <PhotoSlot src={photoUrl} onAdd={onAddPhoto} onRemove={onRemovePhoto} />

            <ContentTextarea
              value={content}
              onChange={onChangeContent}
              maxLength={maxContentLength}
              className="mt-5"
            />

            {footer}
          </>
        )}
      </div>
    </PageShell>
  );
};
