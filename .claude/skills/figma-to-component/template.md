```tsx
import { tv, type VariantProps } from 'tailwind-variants';
import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/shared/lib/cn';

const variants = tv({
  base: 'base-styles',
  variants: {
    variant: { primary: '...', secondary: '...' },
    size: { lg: '...', md: '...', sm: '...' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

type Variants = VariantProps<typeof variants>;

interface ComponentProps extends ComponentPropsWithRef<'div'>, Variants {}

export const Component = ({ className, variant, size, ref, ...props }: ComponentProps) => {
  return <div ref={ref} className={cn(variants({ variant, size }), className)} {...props} />;
};
```
