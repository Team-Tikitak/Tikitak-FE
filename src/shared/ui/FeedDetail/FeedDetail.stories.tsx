import { FeedDetail } from './FeedDetail';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof FeedDetail> = {
  component: FeedDetail,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[393px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FeedDetail>;

const participants = [
  { id: 1, name: '성정수', avatarSrc: 'https://i.pravatar.cc/24?img=1' },
  { id: 2, name: '이시언', avatarSrc: 'https://i.pravatar.cc/24?img=2' },
  { id: 3, name: '김보규', avatarSrc: 'https://i.pravatar.cc/24?img=3' },
  { id: 4, name: '이경준', avatarSrc: 'https://i.pravatar.cc/24?img=4' },
];

const singleAvatar = [{ id: '1', src: 'https://i.pravatar.cc/36?img=1' }] as [
  { id: string; src: string },
];
const multipleAvatars = [
  { id: '1', src: 'https://i.pravatar.cc/36?img=1' },
  { id: '2', src: 'https://i.pravatar.cc/36?img=2' },
] as [{ id: string; src: string }, { id: string; src: string }];

export const Default: Story = {
  args: {
    participants,
    images: [
      {
        src: 'https://picsum.photos/seed/a/393/393',
        pins: [
          { id: '1', x: 20, y: 40, avatars: singleAvatar },
          { id: '2', x: 60, y: 60, count: 'multiple' as const, avatars: multipleAvatars },
        ],
      },
      {
        src: 'https://picsum.photos/seed/b/393/393',
        pins: [{ id: '3', x: 50, y: 30, avatars: singleAvatar }],
      },
      { src: 'https://picsum.photos/seed/c/393/393' },
    ],
    authorName: '정수',
    content: '디자인팀 오늘 망원역에서 대면 회의~',
    date: '2026.05.09',
  },
};

export const WithOutMoreButton: Story = {
  args: {
    participants: participants.slice(0, 2),
    images: [{ src: 'https://picsum.photos/seed/a/393/393' }],
    authorName: '정수',
    content: '디자인팀 오늘 망원역에서 대면 회의~',
    date: '2026.05.09',
  },
};
