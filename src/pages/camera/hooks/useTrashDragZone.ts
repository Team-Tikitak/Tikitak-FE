import { useRef, useState } from 'react';

interface UseTrashDragZoneOptions {
  onMove: (id: string, xRatio: number, yRatio: number) => void;
  onRemove: (id: string) => void;
}

export const useTrashDragZone = ({ onMove, onRemove }: UseTrashDragZoneOptions) => {
  const trashRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const isOverTrashRef = useRef(false);

  const setOverTrash = (next: boolean) => {
    isOverTrashRef.current = next;
    setIsOverTrash(next);
  };

  const isPointerOverTrash = (screenX: number, screenY: number) => {
    const el = trashRef.current;
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      screenX >= rect.left && screenX <= rect.right && screenY >= rect.top && screenY <= rect.bottom
    );
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    setOverTrash(false);
  };

  const handleDragMove = (
    id: string,
    xRatio: number,
    yRatio: number,
    screenX: number,
    screenY: number,
  ) => {
    const overTrash = isPointerOverTrash(screenX, screenY);
    setOverTrash(overTrash);
    if (!overTrash) onMove(id, xRatio, yRatio);
  };

  const handleDragEnd = (id: string) => {
    if (isOverTrashRef.current) onRemove(id);
    setDraggingId(null);
    setOverTrash(false);
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
