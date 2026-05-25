import { ConfirmDialog } from './ConfirmDialog';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex h-[300px] w-[393px] items-center justify-center bg-black/50">
        <Story />
      </div>
    ),
  ],
  args: {
    title: '정말 탈퇴하실 건가요?',
    description: '탈퇴 시 저장된 모든 데이터가 삭제돼요.',
    cancelLabel: '돌아가기',
    confirmLabel: '탈퇴하기',
    destructive: true,
    onCancel: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Destructive: Story = {};

export const Default: Story = {
  args: {
    title: '로딩 중 문제가 발생했어요',
    description: '잠시 후 다시 시도해주세요.',
    confirmLabel: '새로고침',
    destructive: false,
  },
};
