import { Check } from '@/shared/ui/Check';

interface PermissionItemProps {
  name: string;
  description: string;
  checked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const PermissionItem = ({
  name,
  description,
  checked = false,
  disabled = false,
  onClick,
}: PermissionItemProps) => {
  return (
    <button
      type="button"
      className="press-feedback flex w-full items-start gap-[9px] px-3 text-left disabled:opacity-60"
      aria-pressed={checked}
      disabled={disabled}
      onClick={onClick}
    >
      <Check checked={checked} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="body-2 text-gray-800">{name}</p>
        <p className="body-3 text-gray-600">{description}</p>
      </div>
    </button>
  );
};
