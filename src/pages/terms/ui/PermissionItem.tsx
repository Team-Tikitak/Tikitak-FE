import { Check } from '@/shared/ui/Check';

interface PermissionItemProps {
  name: string;
  description: string;
}

export const PermissionItem = ({ name, description }: PermissionItemProps) => {
  return (
    <div className="flex w-full items-start gap-[9px] px-3">
      <Check />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="body-2 text-gray-800">{name}</p>
        <p className="body-3 text-gray-600">{description}</p>
      </div>
    </div>
  );
};
