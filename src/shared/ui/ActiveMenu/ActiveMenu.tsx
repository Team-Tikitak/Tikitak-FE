import {
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import ReportIcon from '@/shared/assets/Icon/alert-triangle.svg?react';
import PencilIcon from '@/shared/assets/Icon/Pencil_Icon.svg?react';
import TrashIcon from '@/shared/assets/Icon/Trash_Icon.svg?react';
import { cn } from '@/shared/lib';

const MORE_LABEL = '\uB354\uBCF4\uAE30';
const EDIT_LABEL = '\uC218\uC815\uD558\uAE30';
const DELETE_LABEL = '\uC0AD\uC81C\uD558\uAE30';
const REPORT_LABEL = '\uC2E0\uACE0\uD558\uAE30';

interface ActiveMenuProps {
  icon: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  deleteItemClassName?: string;
  deleteIconClassName?: string;
  editItemClassName?: string;
  editIconClassName?: string;
  reportItemClassName?: string;
  reportIconClassName?: string;
  renderMenuInPortal?: boolean;
  portalContainer?: HTMLElement | null;
}

export const ActiveMenu = ({
  icon,
  onDelete,
  onEdit,
  onReport,
  className,
  buttonClassName,
  menuClassName,
  deleteItemClassName,
  deleteIconClassName,
  editItemClassName,
  editIconClassName,
  reportItemClassName,
  reportIconClassName,
  renderMenuInPortal = false,
  portalContainer,
}: ActiveMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<CSSProperties>();
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePortalPosition = useCallback(() => {
    const button = ref.current?.querySelector('button');
    if (!button) return;

    const buttonRect = button.getBoundingClientRect();

    if (portalContainer) {
      const containerRect = portalContainer.getBoundingClientRect();
      setPortalStyle({
        top: buttonRect.bottom - containerRect.top + 4,
        right: containerRect.right - buttonRect.right,
      });
      return;
    }

    setPortalStyle({
      top: buttonRect.bottom + 4,
      right: window.innerWidth - buttonRect.right,
    });
  }, [portalContainer]);

  useEffect(() => {
    if (!isOpen || !renderMenuInPortal) return;

    window.addEventListener('resize', updatePortalPosition);
    window.addEventListener('scroll', updatePortalPosition, true);

    return () => {
      window.removeEventListener('resize', updatePortalPosition);
      window.removeEventListener('scroll', updatePortalPosition, true);
    };
  }, [isOpen, renderMenuInPortal, updatePortalPosition]);

  const handleToggle = () => {
    const next = !isOpen;
    if (next && renderMenuInPortal) updatePortalPosition();
    setIsOpen(next);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && !menuRef.current?.contains(target)) {
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
        onClick={handleToggle}
        className={cn('flex size-5 items-center justify-center', buttonClassName)}
        aria-label={MORE_LABEL}
        aria-expanded={isOpen}
      >
        {icon}
      </button>

      {isOpen &&
        (renderMenuInPortal ? (
          createPortal(
            <MenuContent
              ref={menuRef}
              onDelete={onDelete}
              onEdit={onEdit}
              onReport={onReport}
              setIsOpen={setIsOpen}
              className={menuClassName}
              deleteItemClassName={deleteItemClassName}
              deleteIconClassName={deleteIconClassName}
              editItemClassName={editItemClassName}
              editIconClassName={editIconClassName}
              reportItemClassName={reportItemClassName}
              reportIconClassName={reportIconClassName}
              style={portalStyle}
              isPortal
              isPortalRelative={Boolean(portalContainer)}
            />,
            portalContainer ?? document.body,
          )
        ) : (
          <MenuContent
            ref={menuRef}
            onDelete={onDelete}
            onEdit={onEdit}
            onReport={onReport}
            setIsOpen={setIsOpen}
            className={menuClassName}
            deleteItemClassName={deleteItemClassName}
            deleteIconClassName={deleteIconClassName}
            editItemClassName={editItemClassName}
            editIconClassName={editIconClassName}
            reportItemClassName={reportItemClassName}
            reportIconClassName={reportIconClassName}
          />
        ))}
    </div>
  );
};

interface MenuContentProps {
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
  deleteItemClassName?: string;
  deleteIconClassName?: string;
  editItemClassName?: string;
  editIconClassName?: string;
  reportItemClassName?: string;
  reportIconClassName?: string;
  style?: CSSProperties;
  isPortal?: boolean;
  isPortalRelative?: boolean;
  ref: Ref<HTMLDivElement>;
}

const MenuContent = ({
  onDelete,
  onEdit,
  onReport,
  setIsOpen,
  className,
  deleteItemClassName,
  deleteIconClassName,
  editItemClassName,
  editIconClassName,
  reportItemClassName,
  reportIconClassName,
  style,
  isPortal = false,
  isPortalRelative = false,
  ref,
}: MenuContentProps) => (
  <div
    ref={ref}
    data-active-menu
    style={style}
    onPointerDown={(event) => event.stopPropagation()}
    onMouseDown={(event) => event.stopPropagation()}
    onClick={(event) => event.stopPropagation()}
    className={cn(
      'shadow-picker animate-menu-pop pointer-events-auto z-100 flex min-w-[123px] origin-top-right flex-col items-start gap-2 rounded-lg bg-white px-3.5 py-3 will-change-transform motion-reduce:animate-none',
      isPortal ? (isPortalRelative ? 'absolute' : 'fixed') : 'absolute top-6 right-0',
      className,
    )}
  >
    {onDelete && (
      <button
        type="button"
        onClick={() => {
          onDelete();
          setIsOpen(false);
        }}
        className={cn(
          'body-6 flex w-full items-center gap-[7px] whitespace-nowrap text-black',
          deleteItemClassName,
        )}
      >
        <TrashIcon
          className={cn('aspect-square size-6 shrink-0', deleteIconClassName)}
          aria-hidden="true"
        />
        {DELETE_LABEL}
      </button>
    )}
    {onEdit && (
      <button
        type="button"
        onClick={() => {
          onEdit();
          setIsOpen(false);
        }}
        className={cn(
          'body-6 flex w-full items-center gap-[7px] whitespace-nowrap text-black',
          editItemClassName,
        )}
      >
        <PencilIcon
          className={cn('aspect-square size-6 shrink-0', editIconClassName)}
          aria-hidden="true"
        />
        {EDIT_LABEL}
      </button>
    )}
    {onReport && (
      <button
        type="button"
        onClick={() => {
          onReport();
          setIsOpen(false);
        }}
        className={cn(
          'body-6 flex w-full items-center gap-[7px] whitespace-nowrap text-[#ff383c]',
          reportItemClassName,
        )}
      >
        <ReportIcon
          className={cn('aspect-square size-6 shrink-0', reportIconClassName)}
          aria-hidden="true"
        />
        {REPORT_LABEL}
      </button>
    )}
  </div>
);
