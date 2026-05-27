import { type ReactNode, useEffect, useRef, useState } from 'react';
import PencilIcon from '@/shared/assets/Icon/PencilIcon.svg?react';
import TrashIcon from '@/shared/assets/Icon/TrashIcon.svg?react';
import { cn } from '@/shared/lib';

interface ActiveMenuProps {
  icon: ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
  className?: string;
}

export const ActiveMenu = ({ icon, onDelete, onEdit, className }: ActiveMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex size-5 items-center justify-center"
        aria-label="더보기"
        aria-expanded={isOpen}
      >
        {icon}
      </button>

      {isOpen && (
        <div className="shadow-picker absolute top-6 right-0 z-50 flex min-w-[123px] flex-col gap-2 rounded-sm bg-white px-3.5 py-3">
          <button
            type="button"
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="body-6 flex w-full items-center gap-3 text-black"
          >
            <TrashIcon className="w-3.5" aria-hidden="true" />
            삭제하기
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="body-6 flex w-full items-center gap-3 text-black"
            >
              <PencilIcon className="size-3.5" aria-hidden="true" />
              수정하기
            </button>
          )}
        </div>
      )}
    </div>
  );
};
