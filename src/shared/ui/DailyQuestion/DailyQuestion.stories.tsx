import { DailyQuestion } from './DailyQuestion';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/DailyQuestion',
  component: DailyQuestion,
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
} satisfies Meta<typeof DailyQuestion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    question: '오늘 가장 인상 깊었던 순간은?',
    onClick: () => {},
  },
};

export const NonClickable: Story = {
  args: {
    question: '오늘 가장 인상 깊었던 순간은?',
  },
};

export const LongQuestion: Story = {
  args: {
    question: '오늘 하루 팀원들과 함께했던 가장 특별하고 기억에 남는 순간은 무엇이었나요? 그 이유도 함께 적어주세요!',
    onClick: () => {},
  },
};
