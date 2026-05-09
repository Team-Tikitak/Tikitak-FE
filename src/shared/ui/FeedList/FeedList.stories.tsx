import { FeedList } from './FeedList';
import type { Meta, StoryObj } from '@storybook/react-vite';

const FALLBACK_SRC = 'https://picsum.photos/seed/fallback/200/200';
const SAMPLE_FEED_SRC = 'https://picsum.photos/seed/feed/200/200';

const ALL_MEMBERS = [
  { id: 1, src: 'https://picsum.photos/seed/member1/200/200', fallbackSrc: FALLBACK_SRC },
  { id: 2, src: 'https://picsum.photos/seed/member2/200/200', fallbackSrc: FALLBACK_SRC },
  { id: 3, src: 'https://picsum.photos/seed/member3/200/200', fallbackSrc: FALLBACK_SRC },
  { id: 4, src: 'https://picsum.photos/seed/member4/200/200', fallbackSrc: FALLBACK_SRC },
];

const meta = {
  component: FeedList,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeedList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    location: '망원동 센트브',
    title: '기획 디자인 대면 회의',
    date: '2026.04.30',
    imageSrc: SAMPLE_FEED_SRC,
    alt: '피드 이미지',
    imageCount: 4,
    members: ALL_MEMBERS,
  },
};
