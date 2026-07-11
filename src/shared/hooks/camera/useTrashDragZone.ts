import { useRef, useState } from 'react';

const TRASH_HIT_SLOP_PX = 28;

interface UseTrashDragZoneOptions {
  onMove: (id: string, xRatio: number, yRatio: number) => void;
  onRemove: (id: string) => void;
}

export const useTrashDragZone = ({ onMove, onRemove }: UseTrashDragZoneOptions) => {
  const trashRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const isOverTrashRef = useRef(false);
  const trashRectRef = useRef<DOMRect | null>(null);

  const setOverTrash = (next: boolean) => {
    isOverTrashRef.current = next;
    setIsOverTrash(next);
  };

  const isPointerOverTrash = (screenX: number, screenY: number) => {
    const rect = trashRectRef.current;
    if (!rect) return false;
    return (
      screenX >= rect.left - TRASH_HIT_SLOP_PX &&
      screenX <= rect.right + TRASH_HIT_SLOP_PX &&
      screenY >= rect.top - TRASH_HIT_SLOP_PX &&
      screenY <= rect.bottom + TRASH_HIT_SLOP_PX
    );
  };

  const handleDragStart = (_id: string) => {
    // draggingId는 첫 이동에서 켠다 (탭 선택만으론 삭제 모드 진입 방지)
    setOverTrash(false);
    trashRectRef.current = trashRef.current?.getBoundingClientRect() ?? null;
  };

  const handleDragMove = (
    id: string,
    xRatio: number,
    yRatio: number,
    screenX: number,
    screenY: number,
  ) => {
    setDraggingId(id);
    setOverTrash(isPointerOverTrash(screenX, screenY));
    onMove(id, xRatio, yRatio);
  };

  const handleDragEnd = (id: string) => {
    if (isOverTrashRef.current) onRemove(id);
    setDraggingId(null);
    setOverTrash(false);
    trashRectRef.current = null;
  };

  return {
    trashRef,
    draggingId,
    isOverTrash,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
