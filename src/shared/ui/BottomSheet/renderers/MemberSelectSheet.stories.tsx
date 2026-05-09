import { MemberSelectSheet, type MemberSelectSheetItem } from './MemberSelectSheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

const MEMBERS = [
  {
    id: 'sung',
    name: '성정수',
    avatarSrc: 'https://picsum.photos/seed/member-sung/40',
  },
  {
    id: 'sion',
    name: '이시언',
    avatarSrc: 'https://picsum.photos/seed/member-sion/40',
  },
  {
    id: 'bogyu',
    name: '김보규',
    avatarSrc: 'https://picsum.photos/seed/member-bogyu/40',
  },
  {
    id: 'gyeongjun',
    name: '이경준',
    avatarSrc: 'https://picsum.photos/seed/member-gyeongjun/40',
  },
  {
    id: 'hyunwoo',
    name: '배현우',
    avatarSrc: 'https://picsum.photos/seed/member-hyunwoo/40',
  },
  {
    id: 'sujin',
    name: '조수진',
    avatarSrc: 'https://picsum.photos/seed/member-sujin/40',
  },
  {
    id: 'mingyeong',
    name: '김민경',
    avatarSrc: 'https://picsum.photos/seed/member-mingyeong/40',
  },
  {
    id: 'hyeonjin',
    name: '이현진',
    avatarSrc: 'https://picsum.photos/seed/member-hyeonjin/40',
  },
] satisfies MemberSelectSheetItem[];

const meta = {
  component: MemberSelectSheet,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[393px] bg-gray-800 pt-[90px]">
        <Story />
      </div>
    ),
  ],
  args: {
    members: MEMBERS,
    selectedMemberIds: ['sung', 'bogyu', 'sujin'],
  },
} satisfies Meta<typeof MemberSelectSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AddMember: Story = {};
