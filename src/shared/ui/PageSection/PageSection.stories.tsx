import PlusIcon from '@/shared/assets/Icon/PlusIcon.svg?react';
import { ListCard } from '../ListCard';
import { PageSection } from './PageSection';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/PageSection',
  component: PageSection,
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
} satisfies Meta<typeof PageSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithList: Story = {
  args: {
    title: '약관 및 정책',
    children: (
      <>
        <ListCard title="이용 약관" onClick={() => {}} />
        <ListCard title="개인정보 처리방침" onClick={() => {}} />
      </>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: '내 팀',
    icon: <PlusIcon className="size-4" />,
    iconClick: () => {},
    children: (
      <div className="rounded-[12px] bg-gray-100 p-[18px]">
        <p className="text-black">디자인팀</p>
      </div>
    ),
  },
};
