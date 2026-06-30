import { useCallback, useState } from 'react';
import { generateFeedShareCard, type FeedShareCardData } from '@/shared/lib/image/shareCard';
import { shareImageBlob } from '@/shared/lib/native/shareImage';

export const useShareFeedCard = (data: FeedShareCardData | null) => {
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async () => {
    if (!data || isSharing) return;
    setIsSharing(true);
    try {
      const blob = await generateFeedShareCard(data);
      await shareImageBlob(blob, { fileName: 'tikitak-card.jpg', title: data.title });
    } catch (error) {
      // 사용자가 공유 시트를 닫으면 AbortError → 무시
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('카드 공유 실패', error);
    } finally {
      setIsSharing(false);
    }
  }, [data, isSharing]);

  return { share, isSharing };
};
