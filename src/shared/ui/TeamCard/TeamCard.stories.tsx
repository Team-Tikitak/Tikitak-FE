import AvatarBuilder from '@/shared/assets/Character/TakBuilder.svg';
import AvatarCloud from '@/shared/assets/Character/TakBurner.svg';
import AvatarIdea from '@/shared/assets/Character/TakCare.svg';
import AvatarSpark from '@/shared/assets/Character/TakFree.svg';
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
  { id: 1, src: AvatarBuilder },
  { id: 2, src: AvatarSpark },
  { id: 3, src: AvatarCloud },
  { id: 4, src: AvatarIdea },
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
