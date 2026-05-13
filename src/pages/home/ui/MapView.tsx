import { useCallback } from 'react';
import { BottomNavigation } from '@/shared/ui';
import { DailyQuestion } from './DailyQuestion';
import { Map } from './Map';
import { MOCK_PINS } from '../model/mock';

export const MapView = () => {
  // TODO: 핀 목록 조회
  const pins = MOCK_PINS;
  const initialCenter = { latitude: 37.5507563, longitude: 126.9254901 };

  // TODO: 오늘의 질문 조회
  const question = '오늘 OOTD에서 가장 마음에 드는 포인트는?';
  const imageUrls = [
    'https://picsum.photos/seed/a/40',
    'https://picsum.photos/seed/b/40',
    'https://picsum.photos/seed/c/40',
    'https://picsum.photos/seed/d/40',
  ];

  const handlePinClick = useCallback(() => {
    //TODO: 지도 피드 페이지로 이동
  }, []);

  const handleQuestionClick = useCallback(() => {
    //TODO: 게시물 작성 페이지로 이동
  }, []);

  return (
    <div className="pointer-events-none relative isolate flex-1">
      <Map pins={pins} initialCenter={initialCenter} onPinClick={handlePinClick} />
      <div className="pointer-events-auto absolute inset-x-0 top-4 px-5 pt-2">
        <DailyQuestion question={question} imageUrls={imageUrls} onClick={handleQuestionClick} />
      </div>
      <div className="pointer-events-auto absolute inset-x-0 bottom-[calc(16px+env(safe-area-inset-bottom))] flex justify-center px-5">
        <BottomNavigation activeTab="home" />
      </div>
    </div>
  );
};
