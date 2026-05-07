import { type ComponentPropsWithRef, type ComponentPropsWithoutRef, type Ref } from 'react';
import ArrowUpIcon from '@/shared/assets/Icon/line-md_arrow-up.svg?react';
import SearchIcon from '@/shared/assets/Icon/SearchIcon.svg?react';
import { cn } from '@/shared/lib';

type CommentInputFieldOnlyProps = ComponentPropsWithRef<'input'> & {
  variant?: 'comment';
};

type CommentInputFieldWithIconProps = ComponentPropsWithoutRef<'div'> & {
  variant: 'searchbar';
  ref?: Ref<HTMLInputElement>;
  inputProps?: ComponentPropsWithoutRef<'input'>;
};

type CommentInputFieldWithSubmitProps = ComponentPropsWithoutRef<'div'> & {
  variant: 'commentup';
  ref?: Ref<HTMLInputElement>;
  inputProps?: ComponentPropsWithoutRef<'input'>;
  submitButtonProps?: ComponentPropsWithRef<'button'>;
};

type CommentInputFieldProps =
  | CommentInputFieldOnlyProps
  | CommentInputFieldWithIconProps
  | CommentInputFieldWithSubmitProps;

const DEFAULT_PLACEHOLDER = '\uB313\uAE00\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.';
const SUBMIT_ARIA_LABEL = '\uB313\uAE00 \uB4F1\uB85D';

const inputClassName =
  'body-1 h-12 min-w-0 rounded-max bg-gray-200 px-5 text-gray-700 placeholder:text-gray-700 outline-none transition-colors focus-within:bg-gray-100 focus-within:ring-2 focus-within:ring-main-001/40 disabled:cursor-not-allowed disabled:opacity-50';

export const CommentInputField = (props: CommentInputFieldProps) => {
  if (props.variant === 'searchbar') {
    const { inputProps, className, ref, variant: _variant, ...containerProps } = props;
    const {
      className: inputClassNameProp,
      placeholder = DEFAULT_PLACEHOLDER,
      ...restInputProps
    } = inputProps ?? {};

    return (
      <div
        className={cn(inputClassName, 'flex w-full items-center gap-3 overflow-hidden', className)}
        {...containerProps}
      >
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          aria-label={restInputProps['aria-label'] ?? placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-700',
            inputClassNameProp,
          )}
          {...restInputProps}
        />
        <SearchIcon className="size-5 shrink-0 text-gray-700" aria-hidden="true" />
      </div>
    );
  }

  if (props.variant === 'commentup') {
    const {
      inputProps,
      submitButtonProps,
      className,
      ref,
      variant: _variant,
      ...containerProps
    } = props;
    const {
      className: inputClassNameProp,
      disabled: inputDisabled,
      placeholder = DEFAULT_PLACEHOLDER,
      ...restInputProps
    } = inputProps ?? {};
    const {
      className: submitButtonClassName,
      'aria-label': submitAriaLabel,
      disabled: submitDisabled,
      ...restSubmitButtonProps
    } = submitButtonProps ?? {};
    const isSubmitDisabled = submitDisabled ?? inputDisabled;

    return (
      <div className={cn('flex w-full items-center gap-3', className)} {...containerProps}>
        <input
          ref={ref}
          type="text"
          disabled={inputDisabled}
          placeholder={placeholder}
          aria-label={restInputProps['aria-label'] ?? placeholder}
          className={cn(inputClassName, 'w-auto flex-1', inputClassNameProp)}
          {...restInputProps}
        />
        <button
          type="button"
          aria-label={submitAriaLabel ?? SUBMIT_ARIA_LABEL}
          disabled={isSubmitDisabled}
          className={cn(
            'rounded-max bg-main-001 flex size-10 shrink-0 items-center justify-center text-white',
            'active:bg-main-002 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            submitButtonClassName,
          )}
          {...restSubmitButtonProps}
        >
          <ArrowUpIcon className="size-[27px]" aria-hidden="true" />
        </button>
      </div>
    );
  }

  const {
    placeholder = DEFAULT_PLACEHOLDER,
    className,
    ref,
    variant: _variant,
    ...inputProps
  } = props;

  return (
    <input
      ref={ref}
      type="text"
      placeholder={placeholder}
      aria-label={inputProps['aria-label'] ?? placeholder}
      className={cn(inputClassName, 'w-full', className)}
      {...inputProps}
    />
  );
};
