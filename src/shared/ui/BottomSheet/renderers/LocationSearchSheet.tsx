import { useState } from 'react';
import { cn } from '@/shared/lib';
import { CommentInputField } from '../../CommentInputField';
import { Divider } from '../../Divider';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

export interface LocationSearchSheetItem {
  id: string;
  title: string;
  description: string;
}

export interface LocationSearchSheetProps extends Omit<
  BottomSheetProps,
  'children' | 'title' | 'onSelect'
> {
  locations: LocationSearchSheetItem[];
  onSelect?: (locationId: string) => void;
  onQueryChange?: (query: string) => void;
  emptyMessage?: string;
}

export function LocationSearchSheet({
  locations,
  onSelect,
  onQueryChange,
  emptyMessage,
  className,
  ...props
}: LocationSearchSheetProps) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim().toLowerCase();
  const serverMode = typeof onQueryChange === 'function';
  const results = trimmed
    ? serverMode
      ? locations
      : locations.filter((location) => location.title.toLowerCase().includes(trimmed))
    : [];

  return (
    <BottomSheet
      aria-label="장소 검색"
      className={cn('bottom-sheet-base flex flex-col', className)}
      contentClassName="flex min-h-0 flex-1 flex-col"
      {...props}
    >
      <CommentInputField
        variant="searchbar"
        inputProps={{
          placeholder: '장소 검색',
          value: query,
          onChange: (event) => {
            const next = event.target.value;
            setQuery(next);
            onQueryChange?.(next);
          },
        }}
      />
      {trimmed && results.length === 0 && emptyMessage && (
        <p className="body-3 mt-5 w-full text-center text-gray-500">{emptyMessage}</p>
      )}
      <ul className="no-scrollbar mt-5 flex max-h-[117px] w-full flex-col gap-4 overflow-y-auto">
        {results.map((location, index) => (
          <li key={location.id} className="flex flex-col gap-4">
            <button
              type="button"
              className="flex h-[42px] w-full flex-col items-start gap-0.5 text-left"
              onClick={() => onSelect?.(location.id)}
            >
              <span className="body-7 w-full truncate text-black">{location.title}</span>
              <span className="body-1 w-full truncate text-gray-600">{location.description}</span>
            </button>
            {index < results.length - 1 && <Divider />}
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
