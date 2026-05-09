import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { PickerVariants } from './Picker.variant';

type PickerImage = {
  id: string;
  src: string;
  alt?: string;
};

type PickerVariant = 'default' | 'new';

type PickerBaseProps = ComponentPropsWithRef<'button'> & {
  variant?: PickerVariant;
};

type SinglePickerProps = PickerBaseProps & {
  count?: 'single';
  avatars: [PickerImage];
};
type MultiplePickerProps = PickerBaseProps & {
  count: 'multiple';
  avatars: [PickerImage, PickerImage];
};

type PickerProps = SinglePickerProps | MultiplePickerProps;

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
        {avatars.slice(0, count === 'multiple' ? 2 : 1).map((avatar) => (
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
