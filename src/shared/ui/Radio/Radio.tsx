import { type ComponentPropsWithRef } from 'react';
import { tv } from 'tailwind-variants';

const radioContainerVariants = tv({
  base: 'flex cursor-pointer',
});

type RadioProps = Omit<ComponentPropsWithRef<'input'>, 'type'>;

export function Radio({ className, ref, ...props }: RadioProps) {
  return (
    <div className={radioContainerVariants({ className })}>
      <input type="radio" className="peer sr-only" ref={ref} {...props} />
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
        <div className="bg-main-001 hidden h-[14px] w-[14px] rounded-full peer-checked:block" />
      </div>
    </div>
  );
}
