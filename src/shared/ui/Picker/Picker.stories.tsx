import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import TakBurner from '@/shared/assets/Character/TakBurner.svg';
import { Picker } from './Picker';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: Picker,

  parameters: {
    layout: 'centered',
  },

  decorators: [
    (Story) => (
      <div className="items-center p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Picker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NewSingle: Story = {
  args: {
    variant: 'new',
    count: 'single',

    avatars: [
      {
        id: '1',
        src: 'https://picsum.photos/seed/picker1/36/36',
      },
    ],
  },
};

export const DefaultSingle: Story = {
  args: {
    variant: 'default',
    count: 'single',

    avatars: [
      {
        id: '1',
        src: TakBurner,
      },
    ],
  },
};

export const NewMultiple: Story = {
  args: {
    variant: 'new',
    count: 'multiple',

    avatars: [
      {
        id: '1',
        src: TakBurner,
      },
      {
        id: '2',
        src: TakBuilder,
      },
    ],
  },
};

export const DefaultMultiple: Story = {
  args: {
    variant: 'default',
    count: 'multiple',

    avatars: [
      {
        id: '1',
        src: 'https://picsum.photos/seed/picker2/36/36',
      },
      {
        id: '2',
        src: 'https://picsum.photos/seed/picker3/36/36',
      },
    ],
  },
};
