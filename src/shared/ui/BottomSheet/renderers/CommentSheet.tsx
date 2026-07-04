import { type ComponentPropsWithRef, type ComponentPropsWithoutRef, useState } from 'react';
import MoreIcon from '@/shared/assets/Icon/More_Icon.svg?react';
import { MAX_COMMENT_LENGTH } from '@/shared/constants/comment';
import { cn } from '@/shared/lib';
import { ActiveMenu } from '../../ActiveMenu/ActiveMenu';
import { Avatar } from '../../Avatar';
import { CommentInputField } from '../../CommentInputField';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

const COMMENT_TITLE = '\uB313\uAE00';

export interface CommentSheetItem {
  id: string;
  authorName: string;
  text: string;
  avatarSrc: string;
  avatarAlt?: string;
  isMine?: boolean;
  onDelete?: () => void;
}

export type CommentSheetInputProps =
  | {
      inputVariant?: 'comment';
      inputProps?: ComponentPropsWithRef<'input'>;
      submitButtonProps?: never;
    }
  | {
      inputVariant: 'commentup';
      inputProps?: ComponentPropsWithoutRef<'input'>;
      submitButtonProps?: ComponentPropsWithRef<'button'>;
    };

export type CommentSheetProps = Omit<BottomSheetProps, 'children' | 'title'> &
  CommentSheetInputProps & {
    comments: CommentSheetItem[];
    onSubmitComment?: (text: string) => void;
    onDeleteRequest?: (item: CommentSheetItem) => void;
    fitHeight?: boolean;
  };

export function CommentSheet({
  comments,
  inputVariant = 'comment',
  inputProps,
  submitButtonProps,
  onSubmitComment,
  onDeleteRequest,
  fitHeight = false,
  className,
  ...props
}: CommentSheetProps) {
  const [value, setValue] = useState('');
  const hasValue = value.trim().length > 0;

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    setValue('');
    onSubmitComment?.(text);
  };

  return (
    <BottomSheet
      title={COMMENT_TITLE}
      className={cn(
        fitHeight
          ? 'flex h-full flex-col pb-[env(safe-area-inset-bottom)]'
          : 'comment-bottom-sheet-base flex flex-col',
        className,
      )}
      contentClassName="flex min-h-0 flex-1 flex-col"
      {...props}
    >
      <div className="no-scrollbar flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto">
        {comments.map((comment) => (
          <article key={comment.id} className="flex w-full items-center gap-3">
            <Avatar
              src={comment.avatarSrc}
              alt={comment.avatarAlt ?? ''}
              size="lg"
              className="size-10 border-gray-100 p-0"
            />
            <div className="min-w-0 flex-1">
              <div className="body-7 truncate text-black">{comment.authorName}</div>
              <p className="body-1 truncate text-gray-600">{comment.text}</p>
            </div>
            {comment.isMine && (
              <ActiveMenu
                icon={<MoreIcon className="size-5" />}
                buttonClassName="size-5 text-[#666]"
                menuClassName="!w-[100px] !min-w-0 !items-center !justify-center !gap-2 !rounded-[8px] !py-3 !pr-3 !pl-2"
                deleteItemClassName="!w-auto shrink-0 !gap-1.5"
                deleteIconClassName="!size-5 !w-5 shrink-0"
                renderMenuInPortal
                onDelete={() => onDeleteRequest?.(comment)}
              />
            )}
          </article>
        ))}
      </div>
      {inputVariant === 'commentup' ? (
        <CommentInputField
          variant="commentup"
          className="mt-6 mb-4 shrink-0 gap-0"
          inputProps={{
            value,
            maxLength: MAX_COMMENT_LENGTH,
            onChange: (event) => setValue(event.target.value.slice(0, MAX_COMMENT_LENGTH)),
            onKeyDown: (event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            },
            ...inputProps,
          }}
          submitButtonProps={{
            onClick: submit,
            ...submitButtonProps,
            style: {
              ...submitButtonProps?.style,
              width: hasValue ? '40px' : '0',
              marginLeft: hasValue ? '12px' : '0',
              opacity: hasValue ? 1 : 0,
              overflow: 'hidden',
              transition:
                'width 240ms cubic-bezier(0.34, 1.56, 0.64, 1), margin-left 240ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 180ms ease-out',
              pointerEvents: hasValue ? 'auto' : 'none',
            },
          }}
        />
      ) : (
        <CommentInputField className="mt-6 mb-4 shrink-0" {...inputProps} />
      )}
    </BottomSheet>
  );
}
