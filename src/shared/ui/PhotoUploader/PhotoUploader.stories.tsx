import { PhotoUploader, type UploaderPhoto } from './PhotoUploader';
import type { Meta, StoryObj } from '@storybook/react-vite';

const SAMPLES: UploaderPhoto[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  src: `https://picsum.photos/seed/photo${i + 1}/224`,
  alt: `사진 ${i + 1}`,
}));

const meta = {
  component: PhotoUploader,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[353px]">
        <Story />
      </div>
    ),
  ],
  args: {
    max: 10,
    onAdd: () => {},
    onRemove: () => {},
  },
} satisfies Meta<typeof PhotoUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { photos: [] },
};

export const Partial: Story = {
  args: { photos: SAMPLES.slice(0, 5) },
};

export const Full: Story = {
  args: { photos: SAMPLES },
};
