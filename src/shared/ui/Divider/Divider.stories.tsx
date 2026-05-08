import { Divider } from './Divider';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[353px]">
      <Divider {...args} />
    </div>
  ),
};
