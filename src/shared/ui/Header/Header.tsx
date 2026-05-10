import { type ComponentPropsWithRef, type ReactNode } from 'react';
import BackIcon from '@/shared/assets/Icon/BackIcon.svg?react';
import SearchIcon from '@/shared/assets/Icon/SearchIcon.svg?react';
import { cn } from '@/shared/lib';

type HeaderVariant = 'center' | 'left';

interface HeaderProps extends ComponentPropsWithRef<'header'> {
  title?: string;
  variant?: HeaderVariant;
  showBackButton?: boolean;
  backAriaLabel?: string;
  onBack?: () => void;
  rightIcon?: ReactNode;
  rightAriaLabel?: string;
  onRightClick?: () => void;
}

export const Header = ({
  title,
  variant = 'center',
  showBackButton = variant === 'center',
  backAriaLabel = '뒤로 가기',
  onBack,
  rightIcon,
  rightAriaLabel = variant === 'left' ? '검색' : '설정',
  onRightClick,
  className,
  ref,
  ...props
}: HeaderProps) => {
  const resolvedTitle = title ?? '';
  const resolvedRightIcon =
    rightIcon !== undefined ? (
      rightIcon
    ) : variant === 'left' ? (
      <SearchIcon className="size-6" />
    ) : null;

  if (variant === 'left') {
    return (
      <header
        ref={ref}
        className={cn('flex h-[52px] w-full items-center px-5', className)}
        {...props}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="title-2 min-w-0 flex-1 truncate text-left text-black">{resolvedTitle}</h1>
          {resolvedRightIcon && (
            <button
              type="button"
              aria-label={rightAriaLabel}
              onClick={onRightClick}
              className="flex size-6 shrink-0 items-center justify-center text-black"
            >
              {resolvedRightIcon}
            </button>
          )}
        </div>
      </header>
    );
  }

  return (
    <header
      ref={ref}
      className={cn('grid h-[52px] w-full grid-cols-[24px_1fr_24px] items-center px-5', className)}
      {...props}
    >
      {showBackButton ? (
        <button
          type="button"
          aria-label={backAriaLabel}
          onClick={onBack}
          className="flex size-6 items-center justify-center text-black"
        >
          <BackIcon className="size-6" aria-hidden="true" />
        </button>
      ) : (
        <span aria-hidden="true" className="size-6" />
      )}

      <h1 className="title-2 min-w-0 truncate text-center text-black">{resolvedTitle}</h1>

      {resolvedRightIcon ? (
        <button
          type="button"
          aria-label={rightAriaLabel}
          onClick={onRightClick}
          className="flex size-6 items-center justify-center text-black"
        >
          {resolvedRightIcon}
        </button>
      ) : (
        <span aria-hidden="true" className="size-6" />
      )}
    </header>
  );
};
