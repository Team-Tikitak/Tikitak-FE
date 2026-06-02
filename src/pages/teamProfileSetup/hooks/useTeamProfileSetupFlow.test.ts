import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTeamProfileSetupFlow } from './useTeamProfileSetupFlow';
import type { TeamDraftRouteState } from '../model';

const {
  createTeamMock,
  acceptInvitationMock,
  patchTeamProfileMock,
  uploadMediaBlobsMock,
  deleteMediaMock,
} = vi.hoisted(() => ({
  createTeamMock: vi.fn(),
  acceptInvitationMock: vi.fn(),
  patchTeamProfileMock: vi.fn(),
  uploadMediaBlobsMock: vi.fn(),
  deleteMediaMock: vi.fn(),
}));
let locationState: TeamDraftRouteState | null = null;

vi.mock('react-router', () => ({
  useLocation: () => ({ state: locationState }),
}));
vi.mock('@/shared/api/invitation/queries', () => ({
  useAcceptInvitation: () => ({ mutateAsync: acceptInvitationMock, isPending: false }),
}));
vi.mock('@/shared/api/team/queries', () => ({
  useCreateTeam: () => ({ mutateAsync: createTeamMock, isPending: false }),
  usePatchTeamProfile: () => ({ mutateAsync: patchTeamProfileMock, isPending: false }),
}));
vi.mock('@/shared/api/media/api', () => ({
  deleteMedia: deleteMediaMock,
}));
vi.mock('@/shared/api/media/helpers', () => ({
  uploadMediaBlobs: uploadMediaBlobsMock,
}));

const pngFile = () => new File(['x'], 'profile.png', { type: 'image/png' });

describe('useTeamProfileSetupFlow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    locationState = null;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('create 모드에서 아바타 없이 제출하면 업로드 없이 createTeam 을 호출한다', async () => {
    locationState = { mode: 'create', name: '팀이름', description: '소개글' };
    createTeamMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTeamProfileSetupFlow());

    await act(async () => {
      await result.current.submit({ nickname: '닉네임', avatarFile: null });
    });

    expect(uploadMediaBlobsMock).not.toHaveBeenCalled();
    expect(createTeamMock).toHaveBeenCalledWith({
      teamName: '팀이름',
      introduction: '소개글',
      nickName: '닉네임',
    });
  });

  it('업로드 성공 후 mutation 실패 시 업로드한 미디어를 롤백 삭제한다', async () => {
    locationState = { mode: 'create', name: '팀이름', description: '소개글' };
    uploadMediaBlobsMock.mockResolvedValue(['uploaded-id']);
    createTeamMock.mockRejectedValue(new Error('생성 실패'));
    deleteMediaMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useTeamProfileSetupFlow());

    await act(async () => {
      await result.current.submit({ nickname: '닉네임', avatarFile: pngFile() });
    });

    expect(createTeamMock).toHaveBeenCalledWith(
      expect.objectContaining({ mediaPublicId: 'uploaded-id' }),
    );
    expect(deleteMediaMock).toHaveBeenCalledWith('uploaded-id');
  });

  it('업로드 자체가 실패하면 mutation 을 호출하지 않고 중단한다', async () => {
    locationState = { mode: 'create', name: '팀이름', description: '소개글' };
    uploadMediaBlobsMock.mockRejectedValue(new Error('업로드 실패'));
    const { result } = renderHook(() => useTeamProfileSetupFlow());

    await act(async () => {
      await result.current.submit({ nickname: '닉네임', avatarFile: pngFile() });
    });

    expect(createTeamMock).not.toHaveBeenCalled();
    expect(deleteMediaMock).not.toHaveBeenCalled();
  });
});
