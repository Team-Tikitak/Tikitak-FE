import { type ComponentPropsWithRef, type ComponentType, type SVGProps } from 'react';
import TakFree from '@/shared/assets/Character/TakFree.svg?react';
import OrangeSun from '@/shared/assets/Sticker/OrangeSun.svg?react';
import RedBlossom from '@/shared/assets/Sticker/RedBlossom.svg?react';
import StripedBall from '@/shared/assets/Sticker/StripedBall.svg?react';
import YellowFlower from '@/shared/assets/Sticker/YellowFlower.svg?react';
import { cn } from '@/shared/lib';
import { KEY_LAYOUT, type KeyArt, type KeyTone, type Keycap } from '../lib/keycapEngine';
import type { KeyEffect } from '../hooks/useKeycapGame';

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>;

// 키 글자 대신 새기는 티키탁 스티커와 캐릭터(스페이스바)
const ART: Record<KeyArt, { Component: SvgComponent; className: string }> = {
  sun: { Component: OrangeSun, className: 'w-[56%]' },
  flower: { Component: YellowFlower, className: 'w-[58%]' },
  ball: { Component: StripedBall, className: 'w-[54%]' },
  blossom: { Component: RedBlossom, className: 'w-[52%]' },
  tak: { Component: TakFree, className: 'w-[30%]' },
};

// tailwind가 클래스를 찾을 수 있도록 칸 수별 클래스를 그대로 적어 둔다
const SPAN_CLASS: Record<number, string> = {
  2: 'col-span-2',
  3: 'col-span-3',
  6: 'col-span-6',
};

type KeyFace = KeyTone | 'lit' | 'me' | 'bot';

// base: 키캡 아랫면(기울어진 옆면), top: 오목하게 파인 윗면, legend: 새긴 글자
const FACE_CLASS = {
  white: {
    base: 'from-slate-200 to-slate-400',
    top: 'from-white to-slate-100',
    legend: 'text-main-002',
  },
  blue: {
    base: 'from-sky-500 to-sky-700',
    top: 'from-sky-300 to-tak-blue',
    legend: 'text-white',
  },
  pink: {
    base: 'from-pink-300 to-pink-400',
    top: 'from-pink-100 to-pink-200',
    legend: 'text-pink-700',
  },
  // 불이 켜진 키캡은 뒤에서 빛이 비치는 것처럼 노랗게 빛난다
  lit: {
    base: 'from-tak-orange to-orange-600 shadow-[0_0_22px_6px_rgba(255,217,61,0.9)]',
    top: 'from-yellow-200 to-tak-yellow',
    legend: 'text-tak-ink',
  },
  me: {
    base: 'from-main-002 to-main-002',
    top: 'from-sky-300 to-tak-blue',
    legend: 'text-white',
  },
  bot: {
    base: 'from-tak-red to-tak-red',
    top: 'from-orange-300 to-tak-orange',
    legend: 'text-white',
  },
} satisfies Record<KeyFace, { base: string; top: string; legend: string }>;

const faceOf = (key: Keycap, tone: KeyTone): KeyFace =>
  key.phase === 'claimed'
    ? key.owner === 'bot'
      ? 'bot'
      : 'me'
    : key.phase === 'lit'
      ? 'lit'
      : tone;

interface KeycapBoardProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  keys: Keycap[];
  effects?: KeyEffect[];
  onPress?: (index: number) => void;
  /** 손가락을 뗐을 때 (키보드로 누른 경우는 바로 이어서 불린다) */
  onRelease?: (index: number) => void;
}

export function KeycapBoard({
  keys,
  effects = [],
  onPress,
  onRelease,
  className,
  ref,
  ...props
}: KeycapBoardProps) {
  return (
    // 투명한 본체 안에 밝은 판이 들어 있고, 어두운 배경에서 파란 불빛이 번진다
    <div
      ref={ref}
      className={cn(
        'w-full rounded-3xl bg-white/25 p-2 shadow-[0_0_44px_6px_rgba(56,189,248,0.4)] ring-1 ring-white/50',
        className,
      )}
      {...props}
    >
      <div className="grid auto-rows-[clamp(50px,15.5vw,62px)] grid-cols-10 gap-x-1.5 gap-y-2 rounded-2xl bg-slate-100 p-2.5 pb-3">
        {keys.map((key, index) => {
          const layout = KEY_LAYOUT[index];
          const face = faceOf(key, layout.tone);
          const classes = FACE_CLASS[face];
          const pressed = face === 'me' || face === 'bot';
          const keyEffects = effects.filter((effect) => effect.index === index);

          return (
            <button
              // 키캡 위치는 고정이라 index가 곧 식별자다
              key={index}
              type="button"
              aria-label={
                key.phase === 'lit'
                  ? '켜진 키캡'
                  : key.phase === 'claimed'
                    ? key.owner === 'bot'
                      ? '컴퓨터가 가져간 키캡'
                      : '내가 가져간 키캡'
                    : '키캡'
              }
              onPointerDown={() => onPress?.(index)}
              onPointerUp={() => onRelease?.(index)}
              onPointerCancel={() => onRelease?.(index)}
              onClick={(event) => {
                // 키보드(Enter/Space)로 누른 경우만 처리한다. 터치와 마우스는 onPointerDown이 먼저 처리한다.
                if (event.detail === 0) {
                  onPress?.(index);
                  onRelease?.(index);
                }
              }}
              className={cn('relative touch-manipulation select-none', SPAN_CLASS[layout.span])}
            >
              {/* 키캡 아랫면: 앞쪽이 더 길게 기울어져 보이고, 판 위에 그림자를 드리운다 */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 rounded-[10px] bg-gradient-to-b',
                  classes.base,
                  pressed
                    ? 'shadow-[0_1px_2px_rgba(15,23,42,0.35)]'
                    : 'shadow-[0_5px_7px_rgba(15,23,42,0.35)]',
                )}
              />

              {/* 오목하게 파인 윗면. 누르면 아랫면 쪽으로 내려간다 */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-[8%] top-[5%] bottom-[20%] rounded-[8px] bg-gradient-to-b shadow-[inset_0_3px_5px_rgba(15,23,42,0.14),inset_0_-2px_0_rgba(255,255,255,0.85)] ring-1 ring-white/70 motion-safe:transition-transform motion-safe:duration-75',
                  classes.top,
                  pressed && 'translate-y-[12%]',
                )}
              >
                {layout.art && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    {(() => {
                      const { Component, className } = ART[layout.art];
                      return <Component aria-hidden="true" className={cn('h-auto', className)} />;
                    })()}
                  </span>
                )}
                {layout.main && (
                  <span
                    className={cn(
                      'absolute top-[8%] left-[10%] text-[13px] leading-none font-bold',
                      classes.legend,
                    )}
                  >
                    {layout.main}
                  </span>
                )}
                {layout.sub && (
                  <span
                    className={cn(
                      'absolute right-[12%] bottom-[8%] text-[10px] leading-none font-semibold opacity-80',
                      classes.legend,
                    )}
                  >
                    {layout.sub}
                  </span>
                )}
              </span>

              {keyEffects.map((effect) => (
                <span
                  key={effect.id}
                  aria-hidden="true"
                  className={cn(
                    'motion-safe:animate-score-float pointer-events-none absolute inset-x-0 -top-2 z-10 text-center text-xl font-extrabold drop-shadow',
                    effect.kind === 'me' && 'text-main-002',
                    effect.kind === 'bot' && 'text-tak-orange',
                    effect.kind === 'miss' && 'text-tak-red',
                  )}
                >
                  {effect.label}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
