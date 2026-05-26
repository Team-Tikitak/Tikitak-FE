import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PATHS, toPlaceFeeds } from '@/app/routes';
import { DailyQuestion } from '@/shared/ui/DailyQuestion/DailyQuestion';
import { Map } from './Map';
import { MOCK_DAILY_QUESTION, MOCK_PINS } from '../model/mock';
import { type Pin } from '../model/types';

const INITIAL_CENTER = { latitude: 37.5507563, longitude: 126.9254901 };

export const MapView = () => {
  const navigate = useNavigate();

  const handlePinClick = useCallback(
    (pin: Pin) => {
      navigate(toPlaceFeeds(pin.placeId));
    },
    [navigate],
  );

  const handleQuestionClick = useCallback(() => {
    navigate(PATHS.FEED_CREATE);
  }, [navigate]);

  return (
    <div className="pointer-events-none relative isolate w-full flex-1">
      <Map pins={MOCK_PINS} initialCenter={INITIAL_CENTER} onPinClick={handlePinClick} />
      <div className="pointer-events-auto absolute inset-x-0 top-0 z-10">
        <DailyQuestion question={MOCK_DAILY_QUESTION.question} onClick={handleQuestionClick} />
      </div>
    </div>
  );
};
