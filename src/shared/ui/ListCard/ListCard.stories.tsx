import { ListCard } from './ListCard';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: ListCard,
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
} satisfies Meta<typeof ListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '이용 약관',
  },
};
