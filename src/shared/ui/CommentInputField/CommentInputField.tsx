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

const inputFrameClassName =
  'body-1 h-12 min-w-0 rounded-max bg-gray-200 text-gray-700 transition-colors focus-within:bg-gray-100 focus-within:ring-2 focus-within:ring-main-001/40';
const inputControlClassName =
  'h-full min-w-0 bg-transparent px-5 text-gray-700 placeholder:text-gray-700 outline-none disabled:cursor-not-allowed';
const zoomGuardClassName = 'ios-input-zoom-guard ios-input-zoom-guard-box';

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
        className={cn(
          inputFrameClassName,
          'flex w-full items-center gap-3 overflow-hidden px-5',
          restInputProps.disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        {...containerProps}
      >
        <div className="min-w-0 flex-1 overflow-hidden">
          <input
            ref={ref}
            type="text"
            placeholder={placeholder}
            aria-label={restInputProps['aria-label'] ?? placeholder}
            className={cn(
              inputControlClassName,
              'w-full px-0 placeholder:text-gray-700',
              zoomGuardClassName,
              inputClassNameProp,
            )}
            {...restInputProps}
          />
        </div>
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
      onMouseDown: submitOnMouseDown,
      ...restSubmitButtonProps
    } = submitButtonProps ?? {};
    const isSubmitDisabled = submitDisabled ?? inputDisabled;

    return (
      <div className={cn('flex w-full items-center gap-3', className)} {...containerProps}>
        <div
          className={cn(
            inputFrameClassName,
            'flex-1 overflow-hidden',
            inputDisabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <input
            ref={ref}
            type="text"
            disabled={inputDisabled}
            placeholder={placeholder}
            aria-label={restInputProps['aria-label'] ?? placeholder}
            className={cn(inputControlClassName, 'w-full', zoomGuardClassName, inputClassNameProp)}
            {...restInputProps}
          />
        </div>
        <button
          type="button"
          aria-label={submitAriaLabel ?? SUBMIT_ARIA_LABEL}
          disabled={isSubmitDisabled}
          onMouseDown={(event) => {
            event.preventDefault();
            submitOnMouseDown?.(event);
          }}
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
    <div
      className={cn(
        inputFrameClassName,
        'w-full overflow-hidden',
        inputProps.disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        aria-label={inputProps['aria-label'] ?? placeholder}
        className={cn(inputControlClassName, 'w-full', zoomGuardClassName)}
        {...inputProps}
      />
    </div>
  );
};
