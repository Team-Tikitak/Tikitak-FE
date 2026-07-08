import { useEffect, useState } from 'react';
import TikiTakSplashLogo from '@/shared/assets/Logo/tiki-tak_Logo_splash.svg?react';
import { useSplashGate } from '../hooks/useSplashGate';

export const SplashPage = () => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const { alreadySeen, isCheckingLaunchInvite } = useSplashGate({ animationStarted });

  useEffect(() => {
    if (alreadySeen || isCheckingLaunchInvite) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setAnimationStarted(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [alreadySeen, isCheckingLaunchInvite]);

  if (alreadySeen || isCheckingLaunchInvite) return null;

  return (
    <div
      className={`flex flex-1 flex-col items-center px-[25px] pt-[31dvh] ${animationStarted ? 'splash-animate' : ''}`}
    >
      <div className="splash-logo-motion-frame" role="img" aria-label="tiki-tak!">
        <TikiTakSplashLogo className="splash-login-logo-mark" aria-hidden="true" />
      </div>
    </div>
  );
};
