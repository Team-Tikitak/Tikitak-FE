import { type ComponentPropsWithRef, type ComponentPropsWithoutRef } from 'react';
import { Avatar } from '../Avatar';
import { CommentInputField } from '../CommentInputField';
import { BottomSheet } from './BottomSheet';

export interface CommentSheetItem {
  id: string;
  authorName: string;
  text: string;
  avatarSrc: string;
  avatarAlt?: string;
}

type CommentSheetInputProps =
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

type CommentSheetProps = Omit<ComponentPropsWithRef<typeof BottomSheet>, 'children' | 'title'> &
  CommentSheetInputProps & {
    comments: CommentSheetItem[];
  };

export function CommentSheet({
  comments,
  inputVariant = 'comment',
  inputProps,
  submitButtonProps,
  className,
  ...props
}: CommentSheetProps) {
  return (
    <BottomSheet
      title="댓글"
      className={className ?? 'h-[298px]'}
      contentClassName="flex flex-col"
      {...props}
    >
      <div className="flex w-full flex-col gap-5">
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
          </article>
        ))}
      </div>
      {inputVariant === 'commentup' ? (
        <CommentInputField
          variant="commentup"
          className="mt-7"
          inputProps={inputProps}
          submitButtonProps={submitButtonProps}
        />
      ) : (
        <CommentInputField className="mt-7" {...inputProps} />
      )}
    </BottomSheet>
  );
}
