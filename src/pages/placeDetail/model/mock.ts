import { type CommentSheetItem, type Participant } from '@/shared/ui';
import type { PlaceFeedsMock } from './types';

export const MOCK_PIN_COMMENTS: CommentSheetItem[] = [
  {
    id: '1',
    authorName: '이경준',
    text: '디자인은 최고다',
    avatarSrc: 'https://i.pravatar.cc/40?img=4',
  },
  {
    id: '2',
    authorName: '이한진',
    text: '우와 펭!',
    avatarSrc: 'https://i.pravatar.cc/40?img=5',
  },
];

const PARTICIPANTS: Participant[] = [
  { id: 1, name: '성정수', avatarSrc: 'https://i.pravatar.cc/24?img=1' },
  { id: 2, name: '이시언', avatarSrc: 'https://i.pravatar.cc/24?img=2' },
  { id: 3, name: '김보규', avatarSrc: 'https://i.pravatar.cc/24?img=3' },
  { id: 4, name: '이경준', avatarSrc: 'https://i.pravatar.cc/24?img=4' },
];

export const MOCK_PLACE_FEEDS: PlaceFeedsMock = {
  placeName: '망원역',
  feeds: [
    {
      id: 1,
      participants: PARTICIPANTS,
      images: [
        {
          src: 'https://picsum.photos/seed/a/393/393',
          pins: [
            {
              id: '1',
              x: 20,
              y: 40,
              avatars: [{ id: '1', src: 'https://i.pravatar.cc/36?img=1' }],
            },
            {
              id: '2',
              x: 60,
              y: 60,
              count: 'multiple',
              avatars: [
                { id: '1', src: 'https://i.pravatar.cc/36?img=1' },
                { id: '2', src: 'https://i.pravatar.cc/36?img=2' },
              ],
            },
          ],
        },
        {
          src: 'https://picsum.photos/seed/b/393/393',
          pins: [
            {
              id: '3',
              x: 50,
              y: 30,
              avatars: [{ id: '1', src: 'https://i.pravatar.cc/36?img=1' }],
            },
          ],
        },
        { src: 'https://picsum.photos/seed/c/393/393' },
      ],
      authorName: '정수',
      content: '디자인팀 오늘 망원역에서 대면 회의~',
      date: '2026.05.09',
    },
    {
      id: 2,
      participants: PARTICIPANTS,
      images: [
        {
          src: 'https://picsum.photos/seed/d/393/393',
          pins: [
            {
              id: '1',
              x: 30,
              y: 50,
              avatars: [{ id: '3', src: 'https://i.pravatar.cc/36?img=3' }],
            },
          ],
        },
        { src: 'https://picsum.photos/seed/e/393/393' },
      ],
      authorName: '수진',
      content: '음 굿',
      date: '2026.05.09',
    },
  ],
};
