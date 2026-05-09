import { type ComponentPropsWithoutRef } from 'react';
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
  inputProps?: ComponentPropsWithoutRef<'input'>;
  onSelect?: (locationId: string) => void;
}

export function LocationSearchSheet({
  locations,
  inputProps,
  onSelect,
  className,
  ...props
}: LocationSearchSheetProps) {
  return (
    <BottomSheet
      aria-label="장소 검색"
      className={className ?? 'h-[294px]'}
      contentClassName="flex flex-col"
      {...props}
    >
      <CommentInputField variant="searchbar" inputProps={inputProps} />
      <div className="mt-5 flex w-full flex-col gap-4">
        {locations.map((location, index) => (
          <div key={location.id} className="flex flex-col gap-4">
            <button
              type="button"
              className="flex h-[42px] w-full flex-col items-start gap-0.5 text-left"
              onClick={() => onSelect?.(location.id)}
            >
              <span className="body-7 w-full truncate text-black">{location.title}</span>
              <span className="body-1 w-full truncate text-gray-600">{location.description}</span>
            </button>
            {index < locations.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
