import { type ReactNode, useState } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/shared/lib';

type BottomSheetSnapPoint = number | string;
type BottomSheetOverlayChildren =
  | ReactNode
  | ((state: { activeSnapPoint: BottomSheetSnapPoint | null }) => ReactNode);

interface BottomSheetOverlayProps {
  open: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
  children: BottomSheetOverlayChildren;
  className?: string;
  ariaTitle: string;
  ariaDescription?: string;
  snapPoints?: BottomSheetSnapPoint[];
  defaultSnapPoint?: BottomSheetSnapPoint;
  fadeFromIndex?: number;
}

export function BottomSheetOverlay({
  open,
  onClose,
  onExitComplete,
  children,
  className,
  ariaTitle,
  ariaDescription,
  snapPoints,
  defaultSnapPoint,
  fadeFromIndex,
}: BottomSheetOverlayProps) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<BottomSheetSnapPoint | null>(
    defaultSnapPoint ?? snapPoints?.[0] ?? null,
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };
  const handleAnimationEnd = (isOpen: boolean) => {
    if (!isOpen) onExitComplete?.();
  };

  const inner = (
    <Drawer.Portal>
      <Drawer.Overlay
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) * -1)',
        }}
        className="fixed inset-x-0 top-0 z-40 bg-black/50"
      />
      <Drawer.Content
        {...(ariaDescription ? {} : { 'aria-describedby': undefined })}
        onPointerDownOutside={(event) => {
          const target = event.target as Element;
          if (target.closest('[data-active-menu]')) {
            event.preventDefault();
          }
        }}
        onInteractOutside={(event) => {
          const target = event.target as Element;
          if (target.closest('[data-active-menu]')) {
            event.preventDefault();
          }
        }}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full flex-col outline-none sm:max-w-[393px]',
          snapPoints && 'h-full',
          className,
        )}
      >
        <Drawer.Title className="sr-only">{ariaTitle}</Drawer.Title>
        {ariaDescription ? (
          <Drawer.Description className="sr-only">{ariaDescription}</Drawer.Description>
        ) : null}
        {typeof children === 'function' ? children({ activeSnapPoint }) : children}
      </Drawer.Content>
    </Drawer.Portal>
  );

  if (snapPoints) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={handleOpenChange}
        onAnimationEnd={handleAnimationEnd}
        repositionInputs={false}
        snapPoints={snapPoints}
        activeSnapPoint={activeSnapPoint}
        setActiveSnapPoint={setActiveSnapPoint}
        fadeFromIndex={fadeFromIndex ?? snapPoints.length - 1}
      >
        {inner}
      </Drawer.Root>
    );
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleOpenChange}
      onAnimationEnd={handleAnimationEnd}
      repositionInputs={false}
    >
      {inner}
    </Drawer.Root>
  );
}
