import { CameraButton } from './CameraButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: CameraButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CameraButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
