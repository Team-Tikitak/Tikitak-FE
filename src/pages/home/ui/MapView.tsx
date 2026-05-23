import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { toPlaceDetail } from '@/app/routes';
import { Map } from './Map';
import { DailyQuestion } from '../../../shared/ui/DailyQuestion/DailyQuestion';
import { MOCK_DAILY_QUESTION, MOCK_PINS } from '../model/mock';
import { type Pin } from '../model/types';

const INITIAL_CENTER = { latitude: 37.5507563, longitude: 126.9254901 };

export const MapView = () => {
  const navigate = useNavigate();

  const handlePinClick = useCallback(
    (_pin: Pin) => {
      // TODO: 백엔드 연결 후 pin.placeId 사용
      navigate(toPlaceDetail('1'));
    },
    [navigate],
  );

  const handleQuestionClick = useCallback(() => {
    //TODO: 게시물 작성 페이지로 이동
  }, []);

  return (
    <div className="pointer-events-none relative isolate flex-1">
      <Map pins={MOCK_PINS} initialCenter={INITIAL_CENTER} onPinClick={handlePinClick} />
      <div className="pointer-events-auto absolute inset-x-0 top-0 z-10">
        <DailyQuestion question={MOCK_DAILY_QUESTION.question} onClick={handleQuestionClick} />
      </div>
    </div>
  );
};
