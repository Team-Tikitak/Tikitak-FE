import LocationIcon from '@/shared/assets/Icon/LocationIcon.svg?react';
import UserIcon from '@/shared/assets/Icon/UserIcon.svg?react';
import { FormRowButton } from './FormRowButton';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/FormRowButton',
  component: FormRowButton,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-[353px] bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormRowButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Location: Story = {
  args: {
    icon: <LocationIcon className="size-5" />,
    label: '위치 추가',
  },
};

export const Member: Story = {
  args: {
    icon: <UserIcon className="size-5" />,
    label: '인원 추가',
  },
};

export const Disabled: Story = {
  args: {
    icon: <LocationIcon className="size-5" />,
    label: '위치 추가',
    disabled: true,
  },
};
