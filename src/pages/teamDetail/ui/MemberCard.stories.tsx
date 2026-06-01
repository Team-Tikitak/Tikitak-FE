import TakBuilder from '@/shared/assets/Character/TakBuilder.svg';
import { MemberCard } from './MemberCard';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: MemberCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-white">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MemberCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatarSrc: TakBuilder,
    name: '지니지니',
    email: 'js21130@naver.com',
  },
};
