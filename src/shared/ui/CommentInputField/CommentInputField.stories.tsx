import { CommentInputField } from './CommentInputField';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Shared/UI/CommentInputField',
  component: CommentInputField,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof CommentInputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Comment: Story = {
  args: {
    variant: 'comment',
    placeholder: '\uB313\uAE00\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.',
  },
};

export const CommentFilled: Story = {
  args: {
    variant: 'comment',
    defaultValue: '\uC88B\uC740 \uC758\uACAC\uC774\uC5D0\uC694.',
  },
};

export const Commentup: Story = {
  args: {
    variant: 'commentup',
  },
};

export const CommentupFilled: Story = {
  args: {
    variant: 'commentup',
    inputProps: {
      defaultValue: '\uC88B\uC740 \uC758\uACAC\uC774\uC5D0\uC694.',
    },
  },
};

export const Searchbar: Story = {
  args: {
    variant: 'searchbar',
  },
};

export const SearchbarFilled: Story = {
  args: {
    variant: 'searchbar',
    inputProps: {
      defaultValue: '\uB313\uAE00\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694.',
    },
  },
};
