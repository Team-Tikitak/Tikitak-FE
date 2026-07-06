import {
  MultiAnimation,
  WebAnimation,
  type PrepareArgs,
  type SsgoiPathTransition,
  type WebAnimationOptions,
} from '@ssgoi/react';

type Integrator = WebAnimationOptions['integrator'];

// sheet 프리셋(static)과 동일한 물리값 — 진입은 스프링, 퇴장은 관성 낙하
const ENTER_SPRING = { stiffness: 300, damping: 30 };
const EXIT_INERTIA = { acceleration: 30, resistance: 1 };
const SETTLE_EPSILON = 0.005;

const createEnterIntegrator = (): Integrator => ({
  step: ({ position, velocity }, target, dt) => {
    const nextVelocity =
      velocity +
      (ENTER_SPRING.stiffness * (target - position) - ENTER_SPRING.damping * velocity) * dt;
    return { position: position + nextVelocity * dt, velocity: nextVelocity };
  },
  isSettled: ({ position, velocity }, target) =>
    Math.abs(target - position) < SETTLE_EPSILON && Math.abs(velocity) < SETTLE_EPSILON,
});

const createExitIntegrator = (): Integrator => ({
  step: ({ position, velocity }, target, dt) => {
    const direction = Math.sign(target - position) || 1;
    const nextVelocity =
      velocity + (EXIT_INERTIA.acceleration * direction - EXIT_INERTIA.resistance * velocity) * dt;
    return { position: position + nextVelocity * dt, velocity: nextVelocity };
  },
  // 관성 이동은 감쇠 진동이 없으므로 목표에 닿거나 지나치는 순간 정착으로 간주
  isSettled: ({ position, velocity }, target) =>
    Math.abs(target - position) < SETTLE_EPSILON ||
    (velocity !== 0 && (target - position) * velocity < 0),
});

const topSheetTransition = (direction: 'enter' | 'exit') => ({
  prepare: ({ from, to }: PrepareArgs) => {
    const sheetPage = direction === 'enter' ? to : from;
    const backgroundPage = direction === 'enter' ? from : to;
    void sheetPage.then((el) => {
      el.style.willChange = 'transform';
      el.style.backfaceVisibility = 'hidden';
      el.style.contain = 'layout paint';
      if (direction === 'exit') {
        el.style.pointerEvents = 'none';
        el.style.zIndex = '100';
      }
    });
    void backgroundPage.then((el) => {
      if (direction === 'enter') {
        el.style.pointerEvents = 'none';
        el.style.zIndex = '-1';
      }
    });
    return {};
  },
  animation: ({ from, to }: { from: HTMLElement; to: HTMLElement }) => {
    const sheetPage = direction === 'enter' ? to : from;
    const backgroundPage = direction === 'enter' ? from : to;
    // enter: 화면 위(-100%)에서 내려옴, exit: 다시 위로 올라가며 사라짐
    const style =
      direction === 'enter'
        ? (_t: number, u: number) => ({ transform: `translate3d(0, ${-u * 100}%, 0)` })
        : (t: number) => ({ transform: `translate3d(0, ${-t * 100}%, 0)` });
    const sheet = new WebAnimation({
      element: sheetPage,
      integrator: direction === 'enter' ? createEnterIntegrator() : createExitIntegrator(),
      style,
      onComplete: () => {
        sheetPage.style.transform = '';
        sheetPage.style.willChange = 'auto';
        sheetPage.style.backfaceVisibility = '';
        sheetPage.style.contain = '';
        sheetPage.style.pointerEvents = '';
        sheetPage.style.zIndex = '';
        backgroundPage.style.pointerEvents = '';
        backgroundPage.style.zIndex = '';
      },
    });
    return new MultiAnimation([sheet], { mode: 'parallel' });
  },
});

/** sheet 프리셋의 위→아래 미러 — enter 페이지가 화면 위에서 내려오고, 복귀 시 위로 올라가며 닫힘 */
export const topSheet = ({
  enter,
  exit,
}: {
  enter: string;
  exit: string;
}): SsgoiPathTransition[] => [
  { from: exit, to: enter, transition: topSheetTransition('enter') },
  { from: enter, to: exit, transition: topSheetTransition('exit') },
];
