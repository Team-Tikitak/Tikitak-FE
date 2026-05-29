import { useState } from 'react';
import { ContentTextarea } from './ContentTextarea';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/FeedForm/ContentTextarea',
  component: ContentTextarea,
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
  args: {
    maxLength: 1000,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <ContentTextarea {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof ContentTextarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    value: '',
  },
};

export const WithText: Story = {
  args: {
    value: '오늘 망원역에서 디자인팀 회의했어요. 날씨가 좋아서 산책도 좀 했답니다.',
  },
};
