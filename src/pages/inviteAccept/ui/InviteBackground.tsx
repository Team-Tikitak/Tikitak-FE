import GreenLeaf from '@/shared/assets/Sticker/GreenLeaf.svg?react';
import OrangeSpiral from '@/shared/assets/Sticker/OrangeSpiral.svg?react';

export const InviteBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <OrangeSpiral
        aria-hidden="true"
        className="absolute -top-[45px] -left-[100px] h-[230px] w-[245px] rotate-[60deg] opacity-10"
      />
      <GreenLeaf
        aria-hidden="true"
        className="absolute -bottom-5 -left-20 h-[387px] w-[775px] max-w-none rotate-[-25.4deg] opacity-20"
      />
    </div>
  );
};
