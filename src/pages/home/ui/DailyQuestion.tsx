import TakSpark from '@/shared/assets/Character/TakSpark.svg';
import FrontIcon from '@/shared/assets/Icon/FrontIcon.svg?react';
import { ImageWithFallback } from '@/shared/ui';

interface DailyQuestionProps {
  question: string;
  imageUrls: string[];
  onClick?: () => void;
}

export const DailyQuestion = ({ question, imageUrls, onClick }: DailyQuestionProps) => {
  return (
    <button
      type="button"
      className="bg-main-001/70 flex w-full items-center justify-between rounded-2xl p-4 text-white shadow-[inset_0_0_3.267px_0_rgba(255,255,255,0.3),inset_0_0_5.833px_0_rgba(255,255,255,0.1)] backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="flex flex-col gap-[2px]">
        <span className="logo text-left">Today’s Tiki-tak!</span>
        <span className="body-7 text-left">{question}</span>
        <div className="mt-2 flex items-center -space-x-1">
          {imageUrls.map((url) => (
            <ImageWithFallback key={url} src={url} fallbackSrc={TakSpark} />
          ))}
        </div>
      </div>
      <FrontIcon aria-hidden="true" />
    </button>
  );
};
