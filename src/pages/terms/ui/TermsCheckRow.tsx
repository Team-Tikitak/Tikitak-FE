import RightIcon from '@/shared/assets/Icon/RightIcon.svg?react';
import { cn } from '@/shared/lib';
import { Check } from '@/shared/ui/Check';

type TermsCheckRowProps =
  | {
      variant: 'all';
      checked: boolean;
      label: string;
      onToggle: () => void;
      onDetailClick?: never;
    }
  | {
      variant: 'item';
      checked: boolean;
      label: string;
      onToggle: () => void;
      onDetailClick?: () => void;
    };

export const TermsCheckRow = ({
  variant,
  checked,
  label,
  onToggle,
  onDetailClick,
}: TermsCheckRowProps) => {
  if (variant === 'all') {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className="bg-main-000 flex w-full items-center gap-2 rounded-[20px] p-3 text-left"
      >
        <Check checked={checked} />
        <span className="body-2 text-gray-800">{label}</span>
      </button>
    );
  }

  return (
    <div className="flex w-full items-center justify-between px-3">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={checked}
        className={cn('flex items-center gap-[9px] text-left')}
      >
        <Check checked={checked} />
        <span className="body-2 text-gray-800">{label}</span>
      </button>
      {onDetailClick && (
        <button
          type="button"
          onClick={onDetailClick}
          aria-label={`${label} 자세히 보기`}
          className="flex size-6 items-center justify-center text-gray-800"
        >
          <RightIcon className="size-6" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
