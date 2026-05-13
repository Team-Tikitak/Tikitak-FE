import TakSpark from '@/shared/assets/Character/TakSpark.svg';
import FrontIcon from '@/shared/assets/Icon/FrontIcon.svg?react';
import { ImageWithFallback } from '@/shared/ui';

interface TodayQuestionProps {
  question: string;
  imageUrls: string[];
  onClick?: () => void;
}

export const TodayQuestion = ({ question, imageUrls, onClick }: TodayQuestionProps) => {
  return (
    <button
      type="button"
      className="bg-main-001 flex w-full items-center justify-between rounded-md p-4 text-white"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="logo text-left">Today's Tiki-tak!</span>
        <span className="body-7 mt-[2px] text-left">{question}</span>
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
