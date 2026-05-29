import { PhotoStrip, type PhotoStripItem } from './PhotoStrip';
import type { Meta, StoryObj } from '@storybook/react-vite';

const noop = () => {};

const makeItems = (count: number): PhotoStripItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `item-${index}`,
    src: `https://picsum.photos/seed/photo-${index}/200`,
    onRemove: noop,
  }));

const meta = {
  title: 'Shared/UI/FeedForm/PhotoStrip',
  component: PhotoStrip,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-white py-4">
        <Story />
      </div>
    ),
  ],
  args: {
    maxPhotoCount: 10,
    onAddPhoto: noop,
  },
} satisfies Meta<typeof PhotoStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    items: [],
    count: 0,
    canAddMore: true,
  },
};

export const Some: Story = {
  args: {
    items: makeItems(3),
    count: 3,
    canAddMore: true,
  },
};

export const Full: Story = {
  args: {
    items: makeItems(10),
    count: 10,
    canAddMore: false,
  },
};
