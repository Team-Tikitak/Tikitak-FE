import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { Button } from '../Button';

interface GameOverCardProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  score: number;
  /** 제목 아래에 보여줄 한 줄 (예: 승패 결과) */
  description?: string;
  /** 이번 달 내 최고 점수. 리더보드를 쓰지 않으면 생략 */
  bestScore?: number;
  /** 이번 달 내 순위. 최고 기록을 넘기지 못했을 때만 보여준다 */
  rank?: number;
  /** 점수를 보여줄 문구로 바꾸는 함수. 기본은 "N점" */
  formatScore?: (score: number) => string;
  onRestart: () => void;
  /** 주면 다시 하기 아래에 "나가기" 버튼을 보여준다 */
  onExit?: () => void;
}

export function GameOverCard({
  score,
  description,
  bestScore,
  rank,
  formatScore,
  onRestart,
  onExit,
  className,
  ref,
  ...props
}: GameOverCardProps) {
  const format = formatScore ?? ((value: number) => `${value}점`);

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center gap-4 rounded-2xl bg-white px-6 py-7 shadow-lg',
        className,
      )}
      {...props}
    >
      <p className="text-2xl font-extrabold text-black">게임 끝!</p>
      {description && <p className="text-main-002 text-lg font-bold">{description}</p>}
      <div className="flex flex-col items-center gap-1">
        <p
          className={cn(
            'text-center font-extrabold whitespace-pre-line text-black',
            formatScore ? 'text-3xl' : 'text-5xl',
          )}
        >
          {format(score)}
        </p>
        {bestScore !== undefined && (
          <p className="text-base font-medium text-gray-600">
            이번 달 내 최고 {format(Math.max(bestScore, score))}
            {rank !== undefined && score <= bestScore ? ` · ${rank}위` : ''}
          </p>
        )}
      </div>
      <Button variant="primary" onClick={onRestart}>
        다시 하기
      </Button>
      {onExit && (
        <button
          type="button"
          onClick={onExit}
          className="-mt-1 min-h-11 px-3 text-base font-semibold text-gray-600 underline underline-offset-2"
        >
          나가기
        </button>
      )}
    </div>
  );
}
