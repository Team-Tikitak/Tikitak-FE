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
    actorName: '정수',
    feedId: 1,
    createdAt: minutesAgo(30),
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Comment: Story = {
  args: {
    type: 'comment',
    targetName: '보규',
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const DailyFeed: Story = {
  args: {
    type: 'dailyFeed',
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const NoThumbnail: Story = {
  args: {
    type: 'dailyFeed',
  },
};

export const LongName: Story = {
  args: {
    type: 'comment',
    actorName: '아주기다란닉네임을가진사람',
    targetName: '또다른기다란닉네임유저',
    thumbnailUrl: SAMPLE_THUMBNAIL,
  },
};

export const RelativeTimes: Story = {
  args: {
    type: 'comment',
    targetName: '보규',
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
