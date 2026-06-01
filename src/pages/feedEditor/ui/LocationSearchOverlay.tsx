import { useState } from 'react';
import type { FeedPlace } from '@/shared/api/feed/types';
import { useSearchPlaces } from '@/shared/api/place/queries';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  BottomSheetOverlay,
  LocationSearchSheet,
  type LocationSearchSheetItem,
} from '@/shared/ui/BottomSheet';

const PLACE_SEARCH_DEBOUNCE_MS = 300;

interface LocationSearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onExitComplete: () => void;
  onSelect: (place: FeedPlace) => void;
}

export const LocationSearchOverlay = ({
  open,
  onClose,
  onExitComplete,
  onSelect,
}: LocationSearchOverlayProps) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, PLACE_SEARCH_DEBOUNCE_MS);
  const { data, isFetching } = useSearchPlaces({ query: debouncedQuery });

  const places = data?.places ?? [];
  const items: LocationSearchSheetItem[] = places.map((place) => ({
    id: place.kakaoPlaceId,
    title: place.name,
    description: place.roadAddress || place.address,
  }));

  return (
    <BottomSheetOverlay
      open={open}
      onClose={onClose}
      onExitComplete={onExitComplete}
      ariaTitle="장소 검색"
      ariaDescription="장소를 검색해 추가하세요"
    >
      <LocationSearchSheet
        locations={items}
        onQueryChange={setQuery}
        emptyMessage={isFetching ? '검색 중...' : '검색 결과가 없습니다.'}
        onSelect={(kakaoPlaceId) => {
          const picked = places.find((place) => place.kakaoPlaceId === kakaoPlaceId);
          if (!picked) return;
          onSelect({
            placeId: picked.kakaoPlaceId,
            name: picked.name,
            latitude: picked.latitude,
            longitude: picked.longitude,
            address: picked.roadAddress || picked.address,
          });
        }}
      />
    </BottomSheetOverlay>
  );
};
