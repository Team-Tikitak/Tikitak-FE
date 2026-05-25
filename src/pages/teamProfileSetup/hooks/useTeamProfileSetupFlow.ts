import { useState } from 'react';
import { useLocation } from 'react-router';
import { useAcceptInvitation } from '@/shared/api/invitation/queries';
import { deleteMedia } from '@/shared/api/media/api';
import { uploadMediaBlobs } from '@/shared/api/media/helpers';
import { useCreateTeam, usePatchTeamProfile } from '@/shared/api/team/queries';
import type { SubmitProfile, TeamDraftRouteState } from '../model';

export const useTeamProfileSetupFlow = () => {
  const state = useLocation().state as TeamDraftRouteState | null;

  const { mutateAsync: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutateAsync: patchTeamProfile, isPending: isPatching } = usePatchTeamProfile();
  const { mutateAsync: createTeam, isPending: isCreating } = useCreateTeam();
  const [isUploading, setIsUploading] = useState(false);

  const teamName = state ? (state.mode === 'edit' ? state.teamName : state.name) : '';
  const isPending = isAccepting || isPatching || isCreating || isUploading;

  const submit = async ({ nickname, avatarFile, initialProfileImgUrl }: SubmitProfile) => {
    if (!state) return;

    let mediaPublicId = initialProfileImgUrl ?? '';
    let uploadedPublicId: string | null = null;
    if (avatarFile) {
      try {
        setIsUploading(true);
        const [publicId] = await uploadMediaBlobs({
          purpose: 'PROFILE_IMAGE',
          blobs: [avatarFile],
          fileNamePrefix: 'profile',
        });
        mediaPublicId = publicId;
        uploadedPublicId = publicId;
      } catch (error) {
        console.error('프로필 이미지 업로드 실패', error);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    try {
      if (state.mode === 'create') {
        await createTeam({
          teamName: state.name,
          introduction: state.description,
          profileImageUrl: mediaPublicId,
          nickName: nickname,
        });
      } else if (state.mode === 'join') {
        await acceptInvitation({
          token: state.token,
          body: { nickname, profileImgUrl: mediaPublicId },
        });
      } else if (state.mode === 'edit') {
        await patchTeamProfile({
          teamId: state.teamId,
          body: { nickname, profileImgUrl: mediaPublicId },
        });
      }
    } catch (error) {
      if (uploadedPublicId) {
        await deleteMedia(uploadedPublicId).catch(() => {
          // 정리 실패는 무시 (서버 배치가 처리)
        });
      }
      console.error('프로필 저장 실패', error);
    }
  };

  return { state, teamName, submit, isPending };
};
