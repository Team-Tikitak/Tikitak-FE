import { tv } from 'tailwind-variants';
import { Radio } from '@/shared/ui/Radio';
import type { InputHTMLAttributes } from 'react';

const photoRadioVariants = tv({
  base: 'relative flex cursor-pointer overflow-hidden rounded-xs',
});

type PhotoRadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  src: string;
  alt?: string;
  className?: string;
};

export function PhotoRadio({ src, alt = '', className, ...radioProps }: PhotoRadioProps) {
  return (
    <label aria-label="사진 선택" className={photoRadioVariants({ className })}>
      <img src={src} alt={alt} className="h-[115px] w-[115px] object-cover" />
      <Radio className="absolute top-1 right-1" {...radioProps} />
    </label>
  );
}
