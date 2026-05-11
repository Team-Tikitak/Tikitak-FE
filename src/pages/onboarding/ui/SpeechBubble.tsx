import { type ComponentPropsWithRef } from 'react';
import Polygon from '@/shared/assets/Icon/Polygon.svg?react';
import { cn } from '@/shared/lib';

interface SpeechBubbleProps extends ComponentPropsWithRef<'div'> {
  text: string;
}

export const SpeechBubble = ({ text, className, ref, ...props }: SpeechBubbleProps) => {
  return (
    <div
      ref={ref}
      className={cn('relative inline-flex w-fit items-center justify-center', className)}
      {...props}
    >
      <span className="body-7 rounded-2xl bg-gray-900 px-[18px] py-2 text-white">{text}</span>
      <Polygon
        aria-hidden="true"
        className="absolute -bottom-[7px] left-4 h-[15px] w-[17px] text-gray-900"
      />
    </div>
  );
};
