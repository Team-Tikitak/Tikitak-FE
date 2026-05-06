import { cn } from '@/shared/lib/cn';
import { Radio } from '@/shared/ui/Radio/Radio';
import type { InputHTMLAttributes } from 'react';

type PhotoRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  className?: string;
};

export function PhotoRadio({ className, ...radioProps }: PhotoRadioProps) {
  return (
    <label
      aria-label="사진 선택"
      className={cn('relative flex cursor-pointer overflow-hidden rounded-xs', className)}
    >
      <Radio className="absolute top-1 right-1" {...radioProps} />
    </label>
  );
}
