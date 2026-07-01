import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CapturedPhoto } from '@/shared/types/photo';
import { TeamProfileSetupForm } from './TeamProfileSetupForm';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

const { pickMock, submitMock, photoSourceOptionsMock } = vi.hoisted(() => ({
  pickMock: vi.fn(),
  submitMock: vi.fn(),
  photoSourceOptionsMock: vi.fn(),
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/app/layout', () => ({
  PageShell: ({ children, bottom }: { children: ReactNode; bottom?: ReactNode }) => (
    <div>
      {children}
      <div data-testid="bottom">{bottom}</div>
    </div>
  ),
}));

vi.mock('@/shared/hooks/useEdgeSwipeBack', () => ({
  useEdgeSwipeBack: vi.fn(),
}));

vi.mock('@/shared/hooks/usePhotoSourcePicker', () => ({
  usePhotoSourcePicker: (options: unknown) => {
    photoSourceOptionsMock(options);
    return { pick: pickMock, inputProps: { type: 'file', hidden: true } };
  },
}));

vi.mock('@/shared/ui', () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  CommentInputField: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  Header: () => null,
  PageSection: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));

vi.mock('../hooks/useTeamProfileSetupFlow', () => ({
  useTeamProfileSetupFlow: () => ({
    state: { mode: 'create', name: '팀', description: '소개' },
    submit: submitMock,
    isPending: false,
  }),
}));

describe('TeamProfileSetupForm', () => {
  beforeEach(() => {
    pickMock.mockReset();
    submitMock.mockReset();
    photoSourceOptionsMock.mockReset();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:avatar-preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('converts the selected gallery photo to an avatar file and revokes the source URL', () => {
    render(<TeamProfileSetupForm mode="create" promptTeamName="팀" initialNickname="닉네임" />);
    const options = photoSourceOptionsMock.mock.calls.at(-1)?.[0] as {
      source: string;
      onAdd: (photo: CapturedPhoto) => void;
    };
    const sourcePhoto: CapturedPhoto = {
      id: 'avatar-1',
      url: 'blob:selected-avatar',
      blob: new Blob(['avatar'], { type: 'image/png' }),
    };

    act(() => {
      options.onAdd(sourcePhoto);
    });
    fireEvent.click(screen.getByTestId('bottom').querySelector('button') as HTMLButtonElement);

    const submittedFile = submitMock.mock.calls[0][0].avatarFile as File;
    expect(options.source).toBe('gallery');
    expect(submittedFile).toBeInstanceOf(File);
    expect(submittedFile.name).toBe('profile-avatar-1.png');
    expect(submittedFile.type).toBe('image/png');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:selected-avatar');
  });
});
