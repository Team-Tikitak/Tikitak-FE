import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PATHS, toPlaceFeeds } from '@/app/routes';
import type { Pin } from '@/shared/api/map/types';
import { DailyQuestion } from '@/shared/ui/DailyQuestion/DailyQuestion';
import { Map } from './Map';
import { useMapView } from '../hooks/useMapView';
import { useUserLocation } from '../hooks/useUserLocation';

interface MapViewProps {
  teamId: number;
}

export const MapView = ({ teamId }: MapViewProps) => {
  const navigate = useNavigate();

  const { dailyQuestion, pins } = useMapView(teamId);
  const { center } = useUserLocation();

  const handlePinClick = useCallback(
    (pin: Pin) => {
      navigate(toPlaceFeeds(pin.placeId), { state: { thumbnailUrl: pin.thumbnailUrl } });
    },
    [navigate],
  );

  const handleQuestionClick = useCallback(() => {
    navigate(PATHS.DAILY_FEED_CREATE);
  }, [navigate]);

  return (
    <div className="pointer-events-none relative isolate w-full flex-1">
      {center && <Map pins={pins} initialCenter={center} onPinClick={handlePinClick} />}
      <div className="pointer-events-auto absolute inset-x-0 top-0 z-10">
        <DailyQuestion question={dailyQuestion ?? ''} onClick={handleQuestionClick} />
      </div>
    </div>
  );
};
