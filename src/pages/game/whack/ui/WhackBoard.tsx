import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib';
import { BAD_CHARACTER, TAK_CHARACTERS } from './whackAssets';
import type { HitEffect } from '../hooks/useWhackGame';
import type { Mole } from '../lib/whackEngine';

const POP_UP_MS = 120;
const SINK_MS = 160;

interface WhackBoardProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  holes: (Mole | null)[];
  effects?: HitEffect[];
  onWhack?: (index: number) => void;
}

export function WhackBoard({
  holes,
  effects = [],
  onWhack,
  className,
  ref,
  ...props
}: WhackBoardProps) {
  return (
    <div ref={ref} className={cn('grid grid-cols-3 gap-x-2 gap-y-4', className)} {...props}>
      {holes.map((mole, index) => {
        const character = mole?.kind === 'bad' ? BAD_CHARACTER : TAK_CHARACTERS[mole?.variant ?? 0];
        const holeEffects = effects.filter((effect) => effect.hole === index);
        return (
          <button
            // 구멍 위치는 고정이라 index가 곧 식별자다
            key={index}
            type="button"
            aria-label={
              mole ? (mole.kind === 'bad' ? '가시 별 (누르면 감점)' : 'Tak 잡기') : '빈 구멍'
            }
            onPointerDown={() => onWhack?.(index)}
            onClick={(event) => {
              // 키보드(Enter/Space)로 누른 경우만 처리한다. 터치와 마우스는 onPointerDown이 먼저 처리한다.
              if (event.detail === 0) onWhack?.(index);
            }}
            className="relative aspect-square touch-manipulation select-none"
          >
            {/* 노란 흙 테두리와 어두운 구멍 */}
            <div className="bg-tak-yellow absolute inset-x-0 bottom-[2%] h-[38%] rounded-[50%]" />
            <div className="bg-tak-ink absolute inset-x-[7%] bottom-[7%] h-[28%] rounded-[50%]" />

            {/* 구멍 가운데선 아래는 가리고, 위와 옆은 캐릭터가 잘리지 않게 열어 둔다 */}
            <div className="absolute inset-x-0 top-0 bottom-[21%] [clip-path:inset(-50%_-10%_0_-10%)]">
              {mole && character && (
                <div
                  key={mole.id}
                  className="absolute inset-x-[12%] bottom-0 h-full"
                  style={{
                    // 나올 때는 튀어 오르고, 사라지기 직전에는 가라앉는다
                    animation: `mole-up ${POP_UP_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1) both, mole-down ${SINK_MS}ms ease-in ${Math.max(0, mole.lifetime - SINK_MS)}ms forwards`,
                  }}
                >
                  {/* 캐릭터마다 SVG 비율이 달라서, 같은 크기의 칸에 비율을 지켜 담고 아래쪽(구멍)에 맞춘다 */}
                  <character.Component
                    aria-hidden="true"
                    preserveAspectRatio="xMidYMax meet"
                    className="size-full origin-bottom"
                    style={{ transform: `scale(${character.scale})` }}
                  />
                </div>
              )}
            </div>

            {holeEffects.map((effect) => (
              <span key={effect.id} aria-hidden="true" className="pointer-events-none">
                <span
                  className={cn(
                    'motion-safe:animate-poof absolute inset-x-[12%] bottom-[8%] h-[40%] rounded-full',
                    effect.kind === 'tak' ? 'bg-tak-yellow' : 'bg-tak-red',
                  )}
                />
                <span
                  className={cn(
                    'motion-safe:animate-score-float absolute inset-x-0 top-[8%] text-center text-2xl font-extrabold',
                    effect.kind === 'tak' ? 'text-tak-orange' : 'text-tak-red',
                  )}
                >
                  {effect.label}
                </span>
              </span>
            ))}
          </button>
        );
      })}
    </div>
  );
}
