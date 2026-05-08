import { ProgressBar } from './ProgressBar';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: ProgressBar,
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
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1: Story = {
  args: {
    currentStep: 1,
  },
};

export const Step2: Story = {
  args: {
    currentStep: 2,
  },
};

export const Step3: Story = {
  args: {
    currentStep: 3,
  },
};
