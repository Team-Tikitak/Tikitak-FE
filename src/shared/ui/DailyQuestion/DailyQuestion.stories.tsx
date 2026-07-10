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
    question: '아주 길어서 잘릴 수도 있는 오늘의 질문 텍스트가 들어가는 케이스',
    onClick: () => {},
  },
};
