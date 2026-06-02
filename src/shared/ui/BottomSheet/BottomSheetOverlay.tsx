import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/shared/lib';
import { popStatusBarDim, pushStatusBarDim } from '@/shared/lib/statusBarDim';

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
  const dimmedRef = useRef(false);

  // 열림과 동시에 status bar dim, 닫힘 애니메이션 종료/언마운트 시 복원 → 오버레이와 동기화
  useEffect(() => {
    if (open && !dimmedRef.current) {
      dimmedRef.current = true;
      pushStatusBarDim();
    }
  }, [open]);
  useEffect(
    () => () => {
      if (dimmedRef.current) {
        dimmedRef.current = false;
        popStatusBarDim();
      }
    },
    [],
  );

  const releaseDim = () => {
    if (dimmedRef.current) {
      dimmedRef.current = false;
      popStatusBarDim();
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };
  const handleAnimationEnd = (isOpen: boolean) => {
    if (!isOpen) {
      releaseDim();
      onExitComplete?.();
    }
  };

  const inner = (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
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

  const snapProps = snapPoints
    ? { snapPoints, activeSnapPoint, setActiveSnapPoint, fadeFromIndex: fadeFromIndex ?? 0 }
    : {};

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleOpenChange}
      onAnimationEnd={handleAnimationEnd}
      repositionInputs={false}
      {...snapProps}
    >
      {inner}
    </Drawer.Root>
  );
}
