import { type ComponentPropsWithRef } from 'react';
import RedBlossom from '@/shared/assets/Sticker/RedBlossom.svg?react';
import WhiteCloud from '@/shared/assets/Sticker/WhiteCloud.svg?react';
import YellowFlower from '@/shared/assets/Sticker/YellowFlower.svg?react';
import { cn } from '@/shared/lib';

/** 탁 잡기 화면 뒤에 깔리는 장면: 하늘, 해, 구름, 언덕, 앞쪽 풀밭 */
export function WhackBackdrop({ className, ref, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      {...props}
    >
      <div className="bg-tak-yellow absolute top-28 right-5 size-14 rounded-full" />

      <WhiteCloud className="motion-safe:animate-float-y absolute top-8 left-4 w-24" />
      <WhiteCloud className="motion-safe:animate-float-y absolute top-40 right-24 h-auto w-16 [animation-delay:-1.2s]" />
      <WhiteCloud className="motion-safe:animate-float-y absolute top-56 left-[40%] h-auto w-20 [animation-delay:-2.1s]" />

      {/* 먼 언덕 */}
      <div className="bg-tak-blue-light absolute -bottom-24 -left-20 h-72 w-[26rem] rounded-[50%]" />
      <div className="bg-tak-mint absolute -right-24 -bottom-28 h-72 w-[28rem] rounded-[50%]" />

      {/* 앞쪽 풀밭 */}
      <div className="bg-tak-mint absolute inset-x-0 bottom-0 h-16" />
      <YellowFlower className="absolute bottom-3 left-6 h-auto w-9" />
      <RedBlossom className="absolute right-10 bottom-4 h-auto w-8" />
      <YellowFlower className="absolute bottom-2 left-[46%] h-auto w-7" />
    </div>
  );
}
