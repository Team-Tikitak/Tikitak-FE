import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import TakBurner from '@/shared/assets/Character/TakBurner.svg';
import TakCare from '@/shared/assets/Character/TakCare.svg';
import TakFree from '@/shared/assets/Character/TakFree.svg';
import TakLeader from '@/shared/assets/Character/TakLeader.svg';
import TakSpark from '@/shared/assets/Character/TakSpark.svg';
import { AvatarGroup } from './AvatarGroup';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: AvatarGroup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_USERS = [
  { id: 1, src: TakBuilder, alt: 'TakBuilder' },
  { id: 2, src: TakBurner, alt: 'TakBurner' },
  { id: 3, src: TakCare, alt: 'TakCare' },
  { id: 4, src: TakFree, alt: 'TakFree' },
  { id: 5, src: TakLeader, alt: 'TakLeader' },
  { id: 6, src: TakSpark, alt: 'TakSpark' },
];

export const Sm: Story = {
  args: {
    users: SAMPLE_USERS,
    size: 'sm',
  },
};

export const Md: Story = {
  args: {
    users: SAMPLE_USERS,
    size: 'md',
  },
};
