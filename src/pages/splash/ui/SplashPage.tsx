import TikiTakSplashLogo from '@/shared/assets/Logo/tiki-tak_Logo_splash.svg?react';
import { useSplashGate } from '../hooks/useSplashGate';

export const SplashPage = () => {
  const { alreadySeen } = useSplashGate();

  if (alreadySeen) return null;

  return (
    <div className="flex flex-1 flex-col items-center pt-[31dvh]">
      <TikiTakSplashLogo className="view-transition-logo" aria-label="tiki-tak!" />
    </div>
  );
};
