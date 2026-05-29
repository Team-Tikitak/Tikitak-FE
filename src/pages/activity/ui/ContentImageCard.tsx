import { cn } from '@/shared/lib';

interface ContentImageCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  className?: string;
}

export const ContentImageCard = ({
  title,
  description,
  imageUrl,
  className,
}: ContentImageCardProps) => {
  return (
    <div
      className={cn(
        'relative flex h-[204px] flex-1 flex-col items-start gap-1.5 overflow-hidden rounded-lg bg-gray-300 px-3 py-4',
        className,
      )}
      style={
        imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover' } : undefined
      }
    >
      <div className="absolute inset-0 rounded-lg bg-linear-to-b from-black/45 from-30% to-transparent" />
      <p className="relative text-sm font-bold tracking-[0.056px] text-white">{title}</p>
      <p className="relative text-xs font-medium tracking-[0.048px] text-white">{description}</p>
    </div>
  );
};
