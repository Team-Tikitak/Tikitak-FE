import { type Pin } from './types';

export const MOCK_DAILY_QUESTION = {
  question: '오늘 OOTD에서 가장 마음에 드는 포인트는?',
  imageUrls: [
    'https://picsum.photos/seed/a/40',
    'https://picsum.photos/seed/b/40',
    'https://picsum.photos/seed/c/40',
    'https://picsum.photos/seed/d/40',
  ],
};

export const MOCK_PINS: Pin[] = [
  {
    placeId: '1',
    placeName: '망원역',
    latitude: 37.5507563,
    longitude: 126.9254901,
    feedCount: 3,
    thumbnailImageUrl: 'https://picsum.photos/seed/1/87',
  },
  {
    placeId: '2',
    placeName: '합정역',
    latitude: 37.552,
    longitude: 126.927,
    feedCount: 1,
    thumbnailImageUrl: 'https://picsum.photos/seed/2/87',
  },
  {
    placeId: '3',
    placeName: '홍대입구역',
    latitude: 37.5495,
    longitude: 126.924,
    feedCount: 5,
    thumbnailImageUrl: 'https://picsum.photos/seed/3/87',
  },
  {
    placeId: '4',
    placeName: '상수역',
    latitude: 37.5515,
    longitude: 126.923,
    feedCount: 2,
    thumbnailImageUrl: 'https://picsum.photos/seed/4/87',
  },
  {
    placeId: '5',
    placeName: '당인리',
    latitude: 37.55,
    longitude: 126.928,
    feedCount: 4,
    thumbnailImageUrl: 'https://picsum.photos/seed/5/87',
  },
];
