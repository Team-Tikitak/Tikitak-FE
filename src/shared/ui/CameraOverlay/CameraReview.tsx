import { useRef, useState } from 'react';
import CancelIcon from '@/shared/assets/Icon/CancelIcon.svg?react';
import FilterIcon from '@/shared/assets/Icon/FilterIcon.svg?react';
import StickerIcon from '@/shared/assets/Icon/StickerIcon.svg?react';
import TrashIcon from '@/shared/assets/Icon/TrashIcon.svg?react';
import { type StickerId } from '@/shared/assets/Sticker/catalog';
import { useStickerGestures } from '@/shared/hooks/camera/useStickerGestures';
import { useTrashDragZone } from '@/shared/hooks/camera/useTrashDragZone';
import { cn } from '@/shared/lib';
import { getFilterCss, PHOTO_FILTERS, type PhotoFilterId } from '@/shared/lib/image/photoFilter';
import { type PlacedSticker } from '@/shared/types/sticker';
import { Button } from '@/shared/ui';
import { PlacedStickerView } from './PlacedStickerView';
import { StickerPicker } from './StickerPicker';

const FILTER_OPEN_MOTION_CLASS = 'duration-240 ease-[cubic-bezier(0.16,1,0.3,1)]';
const FILTER_CLOSE_MOTION_CLASS = 'duration-180 ease-[cubic-bezier(0.4,0,1,1)]';

interface CameraReviewProps {
  imageUrl: string;
  stickers: PlacedSticker[];
  isConfirming?: boolean;
  onAddSticker: (stickerId: StickerId) => void;
  onMoveSticker: (id: string, xRatio: number, yRatio: number) => void;
  onScaleSticker: (id: string, scale: number) => void;
  onRotateSticker: (id: string, rotation: number) => void;
  onRemoveSticker: (id: string) => void;
  onRetake: () => void;
  onConfirm: () => void;
  activeFilterId: PhotoFilterId;
  onSelectFilter: (id: PhotoFilterId) => void;
}

export const CameraReview = ({
  imageUrl,
  stickers,
  isConfirming = false,
  onAddSticker,
  onMoveSticker,
  onScaleSticker,
  onRotateSticker,
  onRemoveSticker,
  onRetake,
  onConfirm,
  activeFilterId,
  onSelectFilter,
}: CameraReviewProps) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const photoRef = useRef<HTMLDivElement>(null);
  const { trashRef, draggingId, isOverTrash, handleDragStart, handleDragMove, handleDragEnd } =
    useTrashDragZone({ onMove: onMoveSticker, onRemove: onRemoveSticker });
  const { activeId, stickerGestureProps } = useStickerGestures({
    containerRef: photoRef,
    stickers,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onScale: onScaleSticker,
    onRotate: onRotateSticker,
  });

  const handleSelectSticker = (stickerId: StickerId) => {
    onAddSticker(stickerId);
    setIsPickerOpen(false);
  };

  const isToolButtonsCollapsed = isPickerOpen || Boolean(draggingId);
  const shouldShowUploadButton = !isPickerOpen && !isFilterOpen && !draggingId;
  const filterMotionClass = isFilterOpen ? FILTER_OPEN_MOTION_CLASS : FILTER_CLOSE_MOTION_CLASS;
  const toolButtonsMotionClass = isToolButtonsCollapsed
    ? 'duration-220 ease-[cubic-bezier(0.16,1,0.3,1)]'
    : FILTER_CLOSE_MOTION_CLASS;

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col gap-6 overflow-hidden bg-white transition-[padding-bottom] motion-reduce:transition-none',
        filterMotionClass,
        shouldShowUploadButton && 'pb-[calc(112px+env(safe-area-inset-bottom))]',
      )}
    >
      <div
        ref={photoRef}
        {...stickerGestureProps}
        onClick={(event) => {
          if (!isPickerOpen || event.defaultPrevented) return;
          const target = event.target;
          if (target instanceof Element && target.closest('[data-sticker-control]')) return;
          setIsPickerOpen(false);
        }}
        className="relative mt-(--safe-top) aspect-3/4 w-full shrink-0 touch-none overflow-hidden rounded-[20px] bg-black"
      >
        <img
          src={imageUrl}
          alt="촬영된 사진"
          style={{ filter: getFilterCss(activeFilterId) }}
          className="no-native-image relative h-full w-full object-cover"
        />
        {stickers.map((sticker) => (
          <PlacedStickerView
            key={sticker.id}
            sticker={sticker}
            isActive={activeId === sticker.id}
          />
        ))}

        <button
          type="button"
          aria-label="재촬영"
          data-sticker-control
          onClick={onRetake}
          className="press-feedback absolute top-4 left-5 z-10"
        >
          <CancelIcon className="size-9" />
        </button>

        <div
          ref={trashRef}
          aria-hidden={!draggingId}
          className={cn(
            'pointer-events-none absolute bottom-4 left-1/2 z-30 flex size-12 -translate-x-1/2 items-center justify-center rounded-full transition-[opacity,transform,background-color] duration-200 ease-out',
            draggingId ? 'opacity-100' : 'opacity-0',
            isOverTrash ? 'scale-110 bg-red-500' : 'bg-[rgba(30,31,31,0.6)]',
          )}
        >
          <TrashIcon className="size-5 text-white" />
        </div>
      </div>

      <div
        data-testid="camera-filter-tray"
        aria-hidden={!isFilterOpen}
        className={cn(
          'grid transition-[grid-template-rows,opacity,transform] will-change-[grid-template-rows,opacity,transform] motion-reduce:transition-none',
          isFilterOpen
            ? `translate-y-0 grid-rows-[1fr] opacity-100 ${FILTER_OPEN_MOTION_CLASS}`
            : `pointer-events-none translate-y-4 grid-rows-[0fr] opacity-0 ${FILTER_CLOSE_MOTION_CLASS}`,
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="no-scrollbar -mx-1 flex touch-pan-x snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pt-1 pb-2">
            {PHOTO_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-label={`${filter.label} 필터`}
                aria-pressed={activeFilterId === filter.id}
                tabIndex={isFilterOpen ? 0 : -1}
                onClick={() => onSelectFilter(filter.id)}
                className="press-feedback flex w-[78px] shrink-0 snap-start flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    'size-[72px] overflow-hidden rounded-xl border-2 transition-[border-color,transform] duration-160 ease-out',
                    activeFilterId === filter.id ? 'border-main-001' : 'border-transparent',
                  )}
                >
                  <img
                    src={imageUrl}
                    alt=""
                    style={{ filter: filter.css }}
                    className="size-full object-cover"
                  />
                </span>
                <span
                  className={cn(
                    'text-[14px] leading-[1.2] whitespace-nowrap',
                    activeFilterId === filter.id ? 'text-main-001' : 'text-gray-700',
                  )}
                >
                  {filter.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex items-center justify-center gap-8 transition-[opacity,transform] motion-reduce:transition-none',
          isToolButtonsCollapsed ? 'pointer-events-none translate-y-2 opacity-0' : 'opacity-100',
          toolButtonsMotionClass,
        )}
      >
        <button
          type="button"
          aria-label="스티커 추가"
          aria-pressed={isPickerOpen}
          onClick={() => {
            setIsFilterOpen(false);
            setIsPickerOpen((prev) => !prev);
          }}
          className="press-feedback flex flex-col items-center gap-1 text-gray-700"
        >
          <StickerIcon className="size-9" />
          <span className="text-xs">스티커</span>
        </button>
        <button
          type="button"
          aria-label="필터"
          aria-pressed={isFilterOpen}
          onClick={() => {
            setIsPickerOpen(false);
            setIsFilterOpen((prev) => !prev);
          }}
          className="press-feedback flex flex-col items-center gap-1 text-gray-700"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[rgba(30,31,31,0.6)]">
            <FilterIcon className="size-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-xs">필터</span>
        </button>
      </div>

      <div
        data-testid="camera-upload-action"
        aria-hidden={!shouldShowUploadButton}
        className={cn(
          'absolute right-5 bottom-[calc(24px+env(safe-area-inset-bottom))] left-5 z-10 transition-[opacity,transform] motion-reduce:transition-none',
          shouldShowUploadButton
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-3 opacity-0',
          filterMotionClass,
        )}
      >
        <Button
          variant="primary"
          disabled={isConfirming}
          tabIndex={shouldShowUploadButton ? 0 : -1}
          onClick={onConfirm}
        >
          업로드
        </Button>
      </div>

      <StickerPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectSticker}
      />
    </div>
  );
};
