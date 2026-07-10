import { type ComponentPropsWithRef } from 'react';
import { tv } from 'tailwind-variants';
import type { StoredHero as StoredHeroData } from '@/shared/lib/hero/heroStorage';

const storedHeroVariants = tv({
  base: 'no-native-image pointer-events-none absolute z-30 rounded-sm object-cover',
  variants: {
    visible: {
      true: 'opacity-100',
      false: 'opacity-0',
    },
  },
});

interface StoredHeroProps extends Omit<
  ComponentPropsWithRef<'img'>,
  'src' | 'alt' | 'aria-hidden'
> {
  storedHero: StoredHeroData;
  visible?: boolean;
  radius?: string;
}

export const StoredHero = ({
  storedHero,
  visible = true,
  radius = '4',
  className,
  ref,
  style,
  ...props
}: StoredHeroProps) => {
  return (
    <img
      ref={ref}
      {...props}
      data-stored-hero
      data-hero-exit-key={storedHero.heroKey}
      data-hero-radius={radius}
      src={storedHero.thumbnailUrl}
      alt=""
      aria-hidden="true"
      className={storedHeroVariants({ visible, className })}
      style={{
        ...style,
        left: storedHero.left,
        top: storedHero.top,
        width: storedHero.width,
        height: storedHero.height,
      }}
    />
  );
};
