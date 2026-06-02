import { type ComponentPropsWithRef } from 'react';
import TakSpark from '@/shared/assets/Character/TakSpark.svg';
import CloseIcon from '@/shared/assets/Icon/CloseIcon2.svg?react';
import { ImageWithFallback } from '../ImageWithFallback';
import {
  userChipVariants,
  avatarSizeClass,
  innerGapClass,
  type UserChipVariants,
} from './UserChip.variants';

interface UserChipProps extends ComponentPropsWithRef<'div'>, UserChipVariants {
  name: string;
  avatarSrc?: string;
  avatarAlt?: string;
  onRemove?: () => void;
}

export const UserChip = ({
  name,
  avatarSrc,
  avatarAlt = '',
  size = 'md',
  selected = false,
  onRemove,
  className,
  ref,
  ...props
}: UserChipProps) => {
  const textCls = selected
    ? 'button-4 text-main'
    : size === 'sm'
      ? 'button-5 text-gray-900'
      : 'button-2 text-gray-900';

  return (
    <div ref={ref} className={userChipVariants({ size, selected, className })} {...props}>
      <div className={innerGapClass[size]}>
        <ImageWithFallback
          src={avatarSrc}
          fallbackSrc={TakSpark}
          alt={avatarAlt}
          className={`${avatarSizeClass[size]} shrink-0 border-0`}
        />
        <span className={`${textCls} whitespace-nowrap`}>{name}</span>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex size-5 shrink-0 items-center justify-center text-black"
          aria-label="제거"
        >
          <CloseIcon className="size-2.5" />
        </button>
      )}
    </div>
  );
};
