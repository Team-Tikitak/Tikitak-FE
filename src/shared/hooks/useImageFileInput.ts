import { type ChangeEvent, useRef } from 'react';

interface UseImageFileInputOptions {
  multiple?: boolean;
  maxFileSizeBytes?: number;
  acceptedMimeTypes?: readonly string[];
  onSelect: (files: File[]) => void;
}

export const useImageFileInput = ({
  multiple = false,
  maxFileSizeBytes,
  acceptedMimeTypes,
  onSelect,
}: UseImageFileInputOptions) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;

    const accepted: File[] = [];
    for (const file of files) {
      const isMimeOk = acceptedMimeTypes
        ? acceptedMimeTypes.includes(file.type)
        : file.type.startsWith('image/');
      if (!isMimeOk) {
        window.alert(
          acceptedMimeTypes
            ? 'JPEG, PNG, WEBP 이미지만 업로드할 수 있어요.'
            : '이미지 파일만 업로드할 수 있어요.',
        );
        continue;
      }
      if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
        const limitMb = Math.round(maxFileSizeBytes / (1024 * 1024));
        window.alert(`이미지 크기는 ${limitMb}MB 이하여야 해요.`);
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) onSelect(accepted);
  };

  const accept = acceptedMimeTypes?.join(',') ?? 'image/*';

  return {
    openPicker,
    inputProps: {
      ref: inputRef,
      type: 'file' as const,
      accept,
      multiple,
      onChange: handleChange,
      className: 'hidden',
    },
  };
};
