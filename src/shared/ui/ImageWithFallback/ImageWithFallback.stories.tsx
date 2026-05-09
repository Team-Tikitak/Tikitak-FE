import { ImageWithFallback } from './ImageWithFallback';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: ImageWithFallback,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ImageWithFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/200/200',
    fallbackSrc: 'https://picsum.photos/seed/fallback/200/200',
    alt: '프로필 이미지',
  },
};

export const Fallback: Story = {
  args: {
    src: '/invalid-image.png',
    fallbackSrc: 'https://picsum.photos/seed/fallback/200/200',
    alt: '프로필 이미지',
  },
};
