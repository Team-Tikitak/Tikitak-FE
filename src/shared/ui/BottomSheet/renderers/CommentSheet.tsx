import { type ComponentPropsWithRef, type ComponentPropsWithoutRef, useState } from 'react';
import MoreIcon from '@/shared/assets/Icon/MoreIcon.svg?react';
import { cn } from '@/shared/lib';
import { ActiveMenu } from '../../ActiveMenu/ActiveMenu';
import { Avatar } from '../../Avatar';
import { CommentInputField } from '../../CommentInputField';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

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
  };

export function CommentSheet({
  comments,
  inputVariant = 'comment',
  inputProps,
  submitButtonProps,
  onSubmitComment,
  onDeleteRequest,
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
      title="댓글"
      className={cn('bottom-sheet-base flex flex-col', className)}
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
                icon={<MoreIcon className="w-2 rotate-90" />}
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
            onChange: (event) => setValue(event.target.value),
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
