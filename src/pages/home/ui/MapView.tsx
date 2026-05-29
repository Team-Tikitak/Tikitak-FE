import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PATHS, toPlaceFeeds } from '@/app/routes/paths';
import { getFeeds } from '@/shared/api/feed/api';
import { feedKeys } from '@/shared/api/feed/keys';
import type { Pin } from '@/shared/api/map/types';
import { unwrap } from '@/shared/api/request';
import { DailyQuestion } from '@/shared/ui/DailyQuestion/DailyQuestion';
import { Map } from './Map';
import { useMapView } from '../hooks/useMapView';
import { useUserLocation } from '../hooks/useUserLocation';

interface MapViewProps {
  teamId: number;
}

export const MapView = ({ teamId }: MapViewProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { dailyQuestion, showDailyQuestion, pins } = useMapView(teamId);
  const { center } = useUserLocation();

  const handlePinClick = useCallback(
    async (pin: Pin) => {
      const params = { placeId: pin.placeId };
      await queryClient
        .prefetchQuery({
          queryKey: feedKeys.listFiltered(teamId, params),
          queryFn: () => unwrap(() => getFeeds(teamId, params)),
          staleTime: 30 * 1000,
        })
        .catch(() => undefined);

      navigate(toPlaceFeeds(pin.placeId), { state: { thumbnailUrl: pin.thumbnailUrl } });
    },
    [navigate, queryClient, teamId],
  );

  const handleQuestionClick = useCallback(() => {
    navigate(PATHS.DAILY_FEED_CREATE);
  }, [navigate]);

  return (
    <div className="pointer-events-none relative isolate w-full flex-1">
      <Map pins={pins} initialCenter={center} onPinClick={handlePinClick} />
      {showDailyQuestion && (
        <div className="pointer-events-auto absolute inset-x-0 top-0 z-10">
          <DailyQuestion question={dailyQuestion ?? ''} onClick={handleQuestionClick} />
        </div>
      )}
    </div>
  );
};
