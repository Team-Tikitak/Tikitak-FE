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
}

export function LocationSearchSheet({
  locations,
  onSelect,
  className,
  ...props
}: LocationSearchSheetProps) {
  const [query, setQuery] = useState('');
  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? locations.filter((location) => location.title.toLowerCase().includes(trimmed))
    : [];

  return (
    <BottomSheet
      aria-label="장소 검색"
      className={cn('bottom-sheet-base', className)}
      contentClassName="flex flex-col"
      {...props}
    >
      <CommentInputField
        variant="searchbar"
        inputProps={{
          value: query,
          onChange: (event) => setQuery(event.target.value),
        }}
      />
      <ul className="mt-5 flex w-full flex-col gap-4">
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
