import { PhotoSlot } from './PhotoSlot';
import type { Meta, StoryObj } from '@storybook/react-vite';

const noop = () => {};

const meta = {
  title: 'Shared/UI/FeedForm/PhotoSlot',
  component: PhotoSlot,
  parameters: {
    layout: 'centered',
  },
  args: {
    onAdd: noop,
    onRemove: noop,
  },
} satisfies Meta<typeof PhotoSlot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    src: null,
  },
};

export const Filled: Story = {
  args: {
    src: 'https://picsum.photos/seed/photoslot/200',
  },
};
