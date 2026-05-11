import { OnboardingCard } from './OnboardingCard';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: OnboardingCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 353 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OnboardingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '"일단 아이디어 뿌려보자"',
    description: '새로운 돌파구를 찾기 위해 브레인스토밍을 한다',
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    title: '"일단 아이디어 뿌려보자"',
    description: '새로운 돌파구를 찾기 위해 브레인스토밍을 한다',
    isSelected: true,
  },
};
