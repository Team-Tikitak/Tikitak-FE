import { useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { STICKERS, type StickerId } from '@/shared/assets/Sticker/catalog';
import { cn } from '@/shared/lib';

interface StickerPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (stickerId: StickerId) => void;
  className?: string;
}

const COLLAPSED_SNAP = '400px';
const TOP_GAP = 80;

export const StickerPicker = ({ open, onClose, onSelect, className }: StickerPickerProps) => {
  const expandedSnap = useMemo(() => {
    const expanded = Math.max(400, window.innerHeight - TOP_GAP);
    return `${expanded}px`;
  }, []);
  const [activeSnapPoint, setActiveSnapPoint] = useState<number | string | null>(COLLAPSED_SNAP);

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      modal={false}
      snapPoints={[COLLAPSED_SNAP, expandedSnap]}
      activeSnapPoint={activeSnapPoint}
      setActiveSnapPoint={setActiveSnapPoint}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-70 mx-auto flex h-full w-full max-w-[393px] flex-col rounded-t-2xl bg-black/80 outline-none',
            className,
          )}
        >
          <Drawer.Title className="sr-only">스티커 선택</Drawer.Title>
          <Drawer.Description className="sr-only">
            사진에 추가할 스티커를 선택하세요
          </Drawer.Description>
          <div
            aria-hidden="true"
            className="mx-auto mt-4 mb-3 h-1 w-[82px] shrink-0 rounded-[10px] bg-[#e2e2e2]"
          />
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(96px+env(safe-area-inset-bottom))]">
            <div className="grid grid-cols-3 gap-4">
              {STICKERS.map(({ id, Component, label }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  onClick={() => onSelect(id)}
                  className="press-feedback flex aspect-square items-center justify-center"
                >
                  <Component className="size-[72px]" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
