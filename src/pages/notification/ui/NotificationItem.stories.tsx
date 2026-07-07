import { MemoryRouter } from 'react-router';
import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import { NotificationItem } from './NotificationItem';
import type { Meta, StoryObj } from '@storybook/react-vite';

const minutesAgo = (n: number) => new Date(Date.now() - n * 60 * 1000).toISOString();

const SAMPLE_THUMBNAIL = 'https://picsum.photos/seed/tikitak/200/200';

const meta = {
  component: NotificationItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[360px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    avatarUrl: TakBuilder,
    body: '정수님이 보규님께 댓글을 달았어요',
    feedId: 1,
    notificationId: 1,
    createdAt: minutesAgo(30),
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comment: Story = {
  args: {
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const DailyFeed: Story = {
  args: {
    body: '보규님이 오늘의 게시물을 올렸어요',
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const Replied: Story = {
  args: {
    body: 'ㅎㅇ님이 회원님의 댓글에 답글을 남겼어요.',
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const Unread: Story = {
  args: {
    unread: true,
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const NoThumbnail: Story = {
  args: {
    body: '보규님이 오늘의 게시물을 올렸어요',
  },
};

export const LongName: Story = {
  args: {
    body: '아주기다란닉네임을가진사람님이 또다른기다란닉네임유저님께 댓글을 달았어요',
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const RelativeTimes: Story = {
  args: {
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <NotificationItem {...args} createdAt={minutesAgo(0)} />
      <NotificationItem {...args} createdAt={minutesAgo(30)} />
      <NotificationItem {...args} createdAt={minutesAgo(60 * 5)} />
      <NotificationItem {...args} createdAt={minutesAgo(60 * 24 * 3)} />
      <NotificationItem {...args} createdAt={minutesAgo(60 * 24 * 30)} />
    </div>
  ),
};
