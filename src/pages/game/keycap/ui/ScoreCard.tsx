import { type ComponentPropsWithRef, type ComponentType, type SVGProps } from 'react';
import { cn } from '@/shared/lib';

interface ScoreCardProps extends ComponentPropsWithRef<'div'> {
  label: string;
  score: number;
  tone: 'me' | 'bot';
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const TONE_CLASS = {
  me: 'bg-tak-blue',
  bot: 'bg-tak-orange',
} satisfies Record<ScoreCardProps['tone'], string>;

export function ScoreCard({ label, score, tone, Icon, className, ref, ...props }: ScoreCardProps) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-3 py-2',
        TONE_CLASS[tone],
        className,
      )}
      {...props}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white">
        <Icon aria-hidden="true" className="h-auto w-8" />
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <p className="truncate text-sm font-bold text-white/90">{label}</p>
        <p className="text-3xl font-extrabold text-white">{score}</p>
      </div>
    </div>
  );
}
