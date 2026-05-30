import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import { useImageFileInput } from '@/shared/hooks/useImageFileInput';
import { Button, CommentInputField, Header, PageSection } from '@/shared/ui';
import { useTeamProfileSetupFlow } from '../hooks/useTeamProfileSetupFlow';
import { useTeamProfileSetupForm } from '../hooks/useTeamProfileSetupForm';

const HEADER_TITLE = {
  create: '팀 개설',
  join: '팀 참여',
  edit: '프로필 수정',
} as const;

const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_FILE_SIZE_BYTES = 5 * 1024 * 1024;

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
  const { submit, isPending } = useTeamProfileSetupFlow();
  const { nickname, setNickname, avatarFile, avatarPreviewUrl, setAvatar, isDisabled } =
    useTeamProfileSetupForm({
      initialNickname,
      initialAvatarUrl,
    });
  const { openPicker, inputProps } = useImageFileInput({
    acceptedMimeTypes: ALLOWED_AVATAR_MIME_TYPES,
    maxFileSizeBytes: MAX_AVATAR_FILE_SIZE_BYTES,
    onSelect: (files) => {
      if (files[0]) setAvatar(files[0]);
    },
  });

  return (
    <PageShell
      header={<Header title={HEADER_TITLE[mode]} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col px-5 py-7"
      bottom={
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
        onClick={openPicker}
        className="press-feedback mb-7 flex size-28 items-center justify-center self-center overflow-hidden rounded-full border-[1.5px] border-gray-300"
      >
        {(mode === 'edit' ? avatarFile : avatarPreviewUrl) ? (
          <img
            src={avatarPreviewUrl ?? undefined}
            alt=""
            className="no-native-image size-full object-cover"
          />
        ) : (
          <CameraIcon className="h-4.5 w-5 text-black" />
        )}
      </button>
      <input {...inputProps} />
      <PageSection title="이름">
        <CommentInputField
          variant="comment"
          placeholder="이름을 입력하세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </PageSection>
    </PageShell>
  );
};
