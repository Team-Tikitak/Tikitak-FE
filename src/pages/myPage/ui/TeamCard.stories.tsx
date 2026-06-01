import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import TakBurner from '@/shared/assets/Character/TakBurner.svg';
import TakCare from '@/shared/assets/Character/TakCare.svg';
import TakFree from '@/shared/assets/Character/TakFree.svg';
import { TeamCard } from './TeamCard';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: TeamCard,

  parameters: {
    layout: 'centered',
  },

  decorators: [
    (Story) => (
      <div className="w-[393px] bg-white p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TeamCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE_USERS = [
  { id: 1, src: TakBuilder },
  { id: 2, src: TakBurner },
  { id: 3, src: TakCare },
  { id: 4, src: TakFree },
];

export const Leader: Story = {
  args: {
    teamName: '캡스톤 디자인',
    memberCount: 4,
    isLeader: true,
    users: SAMPLE_USERS,
  },
};

export const Member: Story = {
  args: {
    teamName: '캡스톤 디자인',
    memberCount: 3,
    isLeader: false,
    users: SAMPLE_USERS,
  },
};
