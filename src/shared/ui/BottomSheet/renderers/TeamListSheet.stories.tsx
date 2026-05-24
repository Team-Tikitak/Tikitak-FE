import { TeamListSheet, type TeamListSheetItem } from './TeamListSheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

const TEAMS = [
  {
    id: 0,
    title: '캡스톤 디자인 아자잣',
    description: '새로운 게시글 +23',
  },
  {
    id: 1,
    title: '큐시즘 티키탁',
    description: '새로운 게시글 +4',
  },
  {
    id: 2,
    title: '대학교 시디과 소모임',
    description: '새로운 게시글 +87',
  },
] satisfies TeamListSheetItem[];

const meta = {
  component: TeamListSheet,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-gray-800 pt-10">
        <Story />
      </div>
    ),
  ],
  args: {
    teams: TEAMS,
    selectedTeamId: 0,
  },
} satisfies Meta<typeof TeamListSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TeamList: Story = {};
