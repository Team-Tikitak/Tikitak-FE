import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Drawer } from 'vaul';
import { useKeyboardVisible } from '@/shared/hooks/useKeyboardVisible';
import { cn } from '@/shared/lib';
import { setKeyboardResizeMode } from '@/shared/lib/native/keyboardResize';
import { popStatusBarDim, pushStatusBarDim } from '@/shared/lib/native/statusBarDim';

type BottomSheetSnapPoint = number | string;
type BottomSheetOverlayChildren =
  | ReactNode
  | ((state: { activeSnapPoint: BottomSheetSnapPoint | null }) => ReactNode);

const blurActiveElement = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

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
  avoidKeyboard?: boolean;
  repositionInputs?: boolean;
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
  avoidKeyboard = false,
  repositionInputs = false,
}: BottomSheetOverlayProps) {
  const [activeSnapPoint, setActiveSnapPoint] = useState<BottomSheetSnapPoint | null>(
    defaultSnapPoint ?? snapPoints?.[0] ?? null,
  );
  const keyboardVisible = useKeyboardVisible();
  const dimmedRef = useRef(false);
  const shouldAvoidKeyboard = avoidKeyboard && open;

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

  // 키보드 입력 시트는 열린 동안 iOS 웹뷰 리사이즈를 멈춰 시트가 키보드를 부드럽게 따라가게 함
  useEffect(() => {
    if (!avoidKeyboard || !open) return;
    void setKeyboardResizeMode('none');
    return () => {
      void setKeyboardResizeMode('native');
    };
  }, [avoidKeyboard, open]);

  const releaseDim = () => {
    if (dimmedRef.current) {
      dimmedRef.current = false;
      popStatusBarDim();
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      blurActiveElement();
      onClose();
    }
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
        data-keyboard-visible={shouldAvoidKeyboard && keyboardVisible ? 'true' : undefined}
        onPointerDownOutside={(event) => {
          const target = event.target as Element;
          if (target.closest('[data-active-menu]')) {
            event.preventDefault();
            return;
          }
          blurActiveElement();
        }}
        onInteractOutside={(event) => {
          const target = event.target as Element;
          if (target.closest('[data-active-menu]')) {
            event.preventDefault();
            return;
          }
          blurActiveElement();
        }}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full flex-col outline-none sm:max-w-[393px]',
          shouldAvoidKeyboard &&
            'bottom-(--keyboard-height) transition-[bottom] duration-250 ease-[cubic-bezier(0.17,0.59,0.28,1)]',
          snapPoints && 'h-full',
          className,
        )}
      >
        {shouldAvoidKeyboard ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-(--keyboard-height) bg-white"
          />
        ) : null}
        <Drawer.Title className="sr-only">{ariaTitle}</Drawer.Title>
        {ariaDescription ? (
          <Drawer.Description className="sr-only">{ariaDescription}</Drawer.Description>
        ) : null}
        {typeof children === 'function' ? children({ activeSnapPoint }) : children}
        {snapPoints ? (
          // 스냅 사이를 드래그하는 동안 시트 아래 영역이 비어 보이지 않게 흰색으로 채움
          <div aria-hidden="true" className="min-h-0 flex-1 bg-white" />
        ) : null}
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
      repositionInputs={repositionInputs}
      {...snapProps}
    >
      {inner}
    </Drawer.Root>
  );
}
