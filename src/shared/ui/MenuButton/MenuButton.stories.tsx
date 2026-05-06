import { MenuButton } from './MenuButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof MenuButton> = {
  component: MenuButton,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex gap-3 bg-white p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MenuButton>;

export const GridSelected: Story = {
  args: {
    menuType: 'grid',
    selected: true,
  },
};

export const GridDefault: Story = {
  args: {
    menuType: 'grid',
    selected: false,
  },
};

export const ListSelected: Story = {
  args: {
    menuType: 'list',
    selected: true,
  },
};

export const ListDefault: Story = {
  args: {
    menuType: 'list',
    selected: false,
  },
};
