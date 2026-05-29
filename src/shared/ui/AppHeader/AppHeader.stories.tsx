import { AppHeader } from './AppHeader';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    teamName: '디자인팀',
  },
};

export const LongTeamName: Story = {
  args: {
    teamName: '아주아주 긴 팀 이름이 들어가는 경우',
  },
};
