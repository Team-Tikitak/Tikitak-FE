import { ParticipantsSheet, type ParticipantsSheetItem } from './ParticipantsSheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

const BASE_PARTICIPANTS: ParticipantsSheetItem[] = [
  { id: 'sung', name: '성정수', avatarSrc: 'https://picsum.photos/seed/p-sung/40' },
  { id: 'sion', name: '이시언', avatarSrc: 'https://picsum.photos/seed/p-sion/40' },
  { id: 'bogyu', name: '김보규', avatarSrc: 'https://picsum.photos/seed/p-bogyu/40' },
  { id: 'gyeongjun', name: '이경준', avatarSrc: 'https://picsum.photos/seed/p-gj/40' },
  { id: 'hyunwoo', name: '배현우', avatarSrc: 'https://picsum.photos/seed/p-hw/40' },
  { id: 'sujin', name: '조수진', avatarSrc: 'https://picsum.photos/seed/p-sj/40' },
  { id: 'mingyeong', name: '김민경', avatarSrc: 'https://picsum.photos/seed/p-mk/40' },
  { id: 'hyeonjin', name: '이현진', avatarSrc: 'https://picsum.photos/seed/p-hj/40' },
];

const meta = {
  component: ParticipantsSheet,
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
} satisfies Meta<typeof ParticipantsSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FewParticipants: Story = {
  args: {
    participants: BASE_PARTICIPANTS.slice(0, 3),
  },
};

export const EightParticipants: Story = {
  args: {
    participants: BASE_PARTICIPANTS,
  },
};

export const SixteenParticipants: Story = {
  args: {
    participants: [
      ...BASE_PARTICIPANTS,
      ...BASE_PARTICIPANTS.map((participant) => ({
        ...participant,
        id: `${participant.id}-2`,
      })),
    ],
  },
};
