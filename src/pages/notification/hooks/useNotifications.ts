import type { NotificationType } from '../ui/NotificationItem';

export interface NotificationListItem {
  id: number;
  type: NotificationType;
  actorName: string;
  targetName?: string;
  feedId: number;
  avatarUrl?: string | null;
  createdAt: string;
  thumbnailUrl?: string | null;
}

const minutesAgo = (n: number) => new Date(Date.now() - n * 60 * 1000).toISOString();

// TODO: 알림 목록 조회 API(GET) 확정 시 useQuery로 교체. 현재는 UI 확인용 목업.
const MOCK_NOTIFICATIONS: NotificationListItem[] = [
  {
    id: 1,
    type: 'comment',
    actorName: '정수',
    targetName: '보규',
    feedId: 1,
    createdAt: minutesAgo(30),
    thumbnailUrl: 'https://picsum.photos/seed/tikitak1/200/200',
  },
  {
    id: 2,
    type: 'dailyFeed',
    actorName: '보규',
    feedId: 2,
    createdAt: minutesAgo(60 * 3),
    thumbnailUrl: 'https://picsum.photos/seed/tikitak2/200/200',
  },
  {
    id: 3,
    type: 'dailyFeed',
    actorName: '민지',
    feedId: 3,
    createdAt: minutesAgo(60 * 24),
  },
];

export const useNotifications = () => {
  // TODO: 실제 쿼리 연결 시 isLoading/isError를 쿼리 상태로 대체
  return {
    notifications: MOCK_NOTIFICATIONS,
    isLoading: false,
    isError: false,
  };
};
