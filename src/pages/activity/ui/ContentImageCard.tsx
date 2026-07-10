import { cn } from '@/shared/lib';

interface ContentImageCardProps {
  title: string;
  description: string;
  imageUrl?: string;
  heroKey?: string;
  onClick?: () => void;
  className?: string;
}

export const ContentImageCard = ({
  title,
  description,
  imageUrl,
  heroKey,
  onClick,
  className,
}: ContentImageCardProps) => {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? title : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
      className={cn(
        'relative flex h-[204px] flex-1 flex-col items-start gap-1.5 overflow-hidden rounded-lg bg-gray-300 px-3 py-4',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {imageUrl && (
        <img
          {...(heroKey ? { 'data-hero-exit-key': heroKey, 'data-hero-radius': '8' } : {})}
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <div className="absolute inset-0 rounded-lg bg-linear-to-b from-black/45 from-30% to-transparent" />
      <p className="relative text-sm font-bold tracking-[0.056px] text-white">{title}</p>
      <p className="relative text-xs font-medium tracking-[0.048px] text-white">{description}</p>
    </div>
  );
};
