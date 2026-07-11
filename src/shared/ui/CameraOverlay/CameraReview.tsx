import { useRef, useState } from 'react';
import CancelIcon from '@/shared/assets/Icon/CancelIcon.svg?react';
import CheckIcon from '@/shared/assets/Icon/CheckIcon.svg?react';
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

const MOTION_ENTER_CLASS = 'duration-240 ease-[cubic-bezier(0.16,1,0.3,1)]';
const MOTION_EXIT_CLASS = 'duration-180 ease-[cubic-bezier(0.4,0,1,1)]';
const STICKER_DRAG_EXIT_CLASS = 'duration-220 ease-[cubic-bezier(0.2,0.8,0.2,1)]';
const TRASH_MOTION_CLASS = 'duration-240 ease-[cubic-bezier(0.16,1,0.3,1)]';
// vaul 바텀시트가 올라오는 시간(0.5s, cubic-bezier(.32,.72,0,1))과 맞춰 같이 사라지게 한다
const STICKER_SHEET_EXIT_CLASS = 'duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]';

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

  const isStickerDragging = Boolean(draggingId);
  const isToolButtonsCollapsed = isPickerOpen || isFilterOpen || isStickerDragging;
  const shouldShowUploadButton = !isPickerOpen && !isFilterOpen && !isStickerDragging;
  const filterMotionClass = isFilterOpen ? MOTION_ENTER_CLASS : MOTION_EXIT_CLASS;
  const uploadMotionClass = shouldShowUploadButton
    ? MOTION_ENTER_CLASS
    : isStickerDragging
      ? STICKER_DRAG_EXIT_CLASS
      : MOTION_EXIT_CLASS;
  const toolButtonsMotionClass = isToolButtonsCollapsed
    ? isStickerDragging
      ? STICKER_DRAG_EXIT_CLASS
      : isPickerOpen
        ? STICKER_SHEET_EXIT_CLASS
        : filterMotionClass
    : MOTION_ENTER_CLASS;

  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col gap-6 overflow-hidden bg-white',
        shouldShowUploadButton && 'pb-[calc(112px+env(safe-area-inset-bottom))]',
      )}
    >
      <div
        ref={photoRef}
        {...stickerGestureProps}
        onPointerDown={(event) => {
          if (isPickerOpen) {
            const target = event.target;
            if (!(target instanceof Element) || !target.closest('[data-sticker-control]')) {
              setIsPickerOpen(false);
            }
          }
          stickerGestureProps.onPointerDown(event);
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
            isDropping={isOverTrash && draggingId === sticker.id}
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
          data-testid="camera-trash-drop-zone"
          className={cn(
            'pointer-events-none absolute bottom-4 left-1/2 z-30 flex size-14 -translate-x-1/2 items-center justify-center rounded-full backdrop-blur-md transition-[opacity,transform,background-color,box-shadow] will-change-transform motion-reduce:transition-none',
            TRASH_MOTION_CLASS,
            draggingId
              ? 'translate-y-0 scale-100 opacity-100 shadow-[0_12px_32px_rgba(0,0,0,0.24)]'
              : 'translate-y-4 scale-75 opacity-0 shadow-none',
            isOverTrash
              ? 'scale-125 bg-red-500 shadow-[0_18px_40px_rgba(239,68,68,0.35)]'
              : 'bg-[rgba(30,31,31,0.62)]',
          )}
        >
          <TrashIcon
            className={cn(
              'size-5 text-white transition-transform duration-180 ease-out',
              isOverTrash && 'scale-110 -rotate-6',
            )}
          />
        </div>
      </div>

      {/* 아이콘 로우 ↔ 필터 트레이는 같은 칸에 겹쳐 자리 잡아 레이아웃 흔들림 없이 좌우 슬라이드로 전환된다 */}
      <div className="grid w-full min-w-0 overflow-hidden">
        <div
          className={cn(
            'col-start-1 row-start-1 flex w-full min-w-0 items-center justify-center gap-8 self-start transition-[filter,opacity,transform] motion-reduce:transition-none',
            isToolButtonsCollapsed
              ? isFilterOpen
                ? 'pointer-events-none -translate-x-8 scale-[0.98] opacity-0 blur-[1px]'
                : 'pointer-events-none translate-y-3 scale-95 opacity-0 blur-[1px]'
              : 'translate-y-0 scale-100 opacity-100 blur-none',
            toolButtonsMotionClass,
          )}
        >
          <button
            type="button"
            aria-label="스티커 추가"
            aria-pressed={isPickerOpen}
            tabIndex={isToolButtonsCollapsed ? -1 : 0}
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
            tabIndex={isToolButtonsCollapsed ? -1 : 0}
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
          data-testid="camera-filter-tray"
          aria-hidden={!isFilterOpen}
          className={cn(
            'col-start-1 row-start-1 flex w-full min-w-0 flex-col gap-6 transition-[opacity,transform] motion-reduce:transition-none',
            isFilterOpen
              ? `translate-x-0 opacity-100 ${filterMotionClass}`
              : `pointer-events-none translate-x-full opacity-0 ${filterMotionClass}`,
          )}
        >
          <div
            data-testid="camera-filter-header"
            className="grid h-6 grid-cols-[40px_1fr_40px] items-center px-4"
          >
            <span className="body-2 col-start-2 justify-self-center text-black">필터</span>
            <button
              type="button"
              aria-label="필터 편집 완료"
              tabIndex={isFilterOpen ? 0 : -1}
              onClick={() => setIsFilterOpen(false)}
              className="press-feedback col-start-3 flex size-9 items-center justify-center justify-self-end"
            >
              <CheckIcon className="size-6 text-black" />
            </button>
          </div>
          <div className="no-scrollbar flex w-full min-w-0 touch-pan-x snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2">
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
        data-testid="camera-upload-action"
        aria-hidden={!shouldShowUploadButton}
        className={cn(
          'absolute right-5 bottom-[calc(24px+env(safe-area-inset-bottom))] left-5 z-10 transition-[filter,opacity,transform] motion-reduce:transition-none',
          shouldShowUploadButton
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0 blur-[1px]',
          uploadMotionClass,
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
