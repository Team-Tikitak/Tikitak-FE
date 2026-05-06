import { type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  className?: string;
};

export function Radio({ checked, onChange, className, ...props }: RadioProps) {
  return (
    <div className={cn('flex cursor-pointer', className)}>
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} {...props} />
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
        {checked && <div className="bg-main-001 h-[14px] w-[14px] rounded-full" />}
      </div>
    </div>
  );
}
