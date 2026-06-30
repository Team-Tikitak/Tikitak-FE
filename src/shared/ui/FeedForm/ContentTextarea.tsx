export interface ContentTextareaProps {
  value: string;
  onChange: (next: string) => void;
  maxLength: number;
  placeholder?: string;
  className?: string;
}

export const ContentTextarea = ({
  value,
  onChange,
  maxLength,
  placeholder = '(선택) 글을 작성해주세요.',
  className,
}: ContentTextareaProps) => (
  <div
    className={`flex h-[174px] flex-col gap-2 rounded-lg border border-gray-300 p-4 ${className ?? ''}`}
  >
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={placeholder}
      placeholder={placeholder}
      maxLength={maxLength}
      className="ios-textarea-zoom-guard font-pretendard placeholder:font-pretendard min-h-0 flex-1 resize-none leading-[1.4] tracking-[-0.004em] text-gray-900 outline-none placeholder:text-gray-900"
    />
    <p className="body-10 self-end text-gray-500">
      <span>{value.length}</span> / {maxLength.toLocaleString()}
    </p>
  </div>
);
