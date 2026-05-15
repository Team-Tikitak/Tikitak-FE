import { LocationSearchSheet, type LocationSearchSheetItem } from './LocationSearchSheet';
import type { Meta, StoryObj } from '@storybook/react-vite';

const LOCATIONS = [
  {
    id: '1',
    title: 'loc info',
    description: 'text',
  },
  {
    id: '2',
    title: 'loc info',
    description: 'text',
  },
] satisfies LocationSearchSheetItem[];

const meta = {
  component: LocationSearchSheet,
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
    locations: LOCATIONS,
  },
} satisfies Meta<typeof LocationSearchSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchLocation: Story = {};
