import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { PickerVariants } from './Picker.variant';

type PickerImage = {
  id: string;
  src: string;
  alt?: string;
};

type PickerVariant = 'default' | 'new';

type PickerProps = ComponentPropsWithRef<'button'> & {
  variant?: PickerVariant;
  count?: 'single' | 'multiple';
  avatars: PickerImage[];
};

export function Picker({
  variant = 'default',
  count = 'single',
  avatars,
  className,
  ref,
  ...props
}: PickerProps) {
  return (
    <button
      type="button"
      ref={ref}
      aria-label="picker"
      className={cn(PickerVariants({ variant, count }), className)}
      {...props}
    >
      <div className={cn('flex items-center', count === 'multiple' && '-space-x-2')}>
        {avatars.map((avatar) => (
          <img
            key={avatar.id}
            src={avatar.src}
            alt=""
            aria-hidden="true"
            className="size-9 rounded-full bg-white"
          />
        ))}
      </div>
    </button>
  );
}
