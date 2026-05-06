import { PhotoRadio } from './PhotoRadio';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: PhotoRadio,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PhotoRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400';

export const Default: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'sample image',
  },
};

export const Checked: Story = {
  args: {
    src: SAMPLE_IMAGE,
    alt: 'sample image',
    checked: true,
  },
};
