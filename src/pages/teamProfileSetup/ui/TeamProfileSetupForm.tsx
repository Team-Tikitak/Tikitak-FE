import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import { MAX_TEAM_NICKNAME_LENGTH } from '@/shared/constants/team';
import { useEdgeSwipeBack } from '@/shared/hooks/useEdgeSwipeBack';
import { useKeyboardVisible } from '@/shared/hooks/useKeyboardVisible';
import { usePhotoSourcePicker } from '@/shared/hooks/usePhotoSourcePicker';
import type { CapturedPhoto } from '@/shared/types/photo';
import { Button, CommentInputField, Header, PageSection } from '@/shared/ui';
import { useTeamProfileSetupFlow } from '../hooks/useTeamProfileSetupFlow';
import { useTeamProfileSetupForm } from '../hooks/useTeamProfileSetupForm';

const HEADER_TITLE = {
  create: '팀 개설',
  join: '팀 참여',
  edit: '프로필 수정',
} as const;

const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const createAvatarFile = ({ id, blob }: CapturedPhoto) => {
  const contentType = blob.type || 'image/jpeg';
  const extension = contentType.split('/')[1] ?? 'jpg';
  return new File([blob], `profile-${id}.${extension}`, { type: contentType });
};

interface TeamProfileSetupFormProps {
  mode: 'create' | 'join' | 'edit';
  promptTeamName: string;
  initialNickname?: string;
  initialAvatarUrl?: string;
}

export const TeamProfileSetupForm = ({
  mode,
  promptTeamName,
  initialNickname,
  initialAvatarUrl,
}: TeamProfileSetupFormProps) => {
  const navigate = useNavigate();
  const isKeyboardVisible = useKeyboardVisible();
  const { state, submit, isPending } = useTeamProfileSetupFlow();
  const { nickname, setNickname, avatarFile, avatarPreviewUrl, setAvatar, isDisabled } =
    useTeamProfileSetupForm({
      initialNickname,
      initialAvatarUrl: mode === 'edit' ? undefined : initialAvatarUrl,
    });

  const handleBack = useCallback(() => {
    if (state?.mode === 'create') {
      navigate(PATHS.TEAM_CREATE, {
        state: {
          name: state.name,
          description: state.description,
        },
        replace: true,
      });
      return;
    }

    navigate(-1);
  }, [navigate, state]);

  useEdgeSwipeBack(handleBack);

  const { pick, inputProps } = usePhotoSourcePicker({
    remaining: 1,
    source: 'gallery',
    acceptedMimeTypes: ALLOWED_AVATAR_MIME_TYPES,
    maxFileSizeBytes: MAX_AVATAR_FILE_SIZE_BYTES,
    onAdd: (photo) => {
      setAvatar(createAvatarFile(photo));
      URL.revokeObjectURL(photo.url);
    },
  });

  return (
    <PageShell
      header={<Header title={HEADER_TITLE[mode]} showBackButton onBack={handleBack} />}
      contentClassName="flex flex-col px-5 py-7"
      bottom={
        isKeyboardVisible ? null : (
          <Button
            variant="primary"
            disabled={isDisabled || isPending}
            onClick={() =>
              submit({
                nickname,
                avatarFile,
              })
            }
          >
            완료
          </Button>
        )
      }
    >
      <h2 className="title-1 mb-15 text-start text-black">
        {promptTeamName}에서
        <br />
        프로필을 어떻게 설정할까요?
      </h2>
      <button
        type="button"
        aria-label="프로필 사진 선택"
        onClick={() => void pick()}
        className="press-feedback mb-7 flex aspect-square size-28 shrink-0 items-center justify-center self-center overflow-hidden rounded-full border-[1.5px] border-gray-300"
      >
        {avatarPreviewUrl ? (
          <img src={avatarPreviewUrl} alt="" className="no-native-image size-full object-cover" />
        ) : (
          <CameraIcon className="h-4.5 w-5 text-black" />
        )}
      </button>
      <input {...inputProps} />
      <PageSection title="이름">
        <CommentInputField
          variant="comment"
          placeholder="이름을 입력하세요"
          maxLength={MAX_TEAM_NICKNAME_LENGTH}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          enterKeyHint="done"
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
        />
      </PageSection>
    </PageShell>
  );
};
