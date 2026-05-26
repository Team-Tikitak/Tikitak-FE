import { useRef } from 'react';
import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import { Button, CommentInputField, Header, PageSection } from '@/shared/ui';
import { useTeamProfileSetupFlow } from '../hooks/useTeamProfileSetupFlow';
import { useTeamProfileSetupForm } from '../hooks/useTeamProfileSetupForm';

const HEADER_TITLE = {
  create: '팀 개설',
  join: '팀 참여',
  edit: '프로필 수정',
} as const;

interface TeamProfileSetupFormProps {
  mode: 'create' | 'join' | 'edit';
  promptTeamName: string;
  initialNickname?: string;
  initialAvatarUrl?: string;
  initialProfileImgUrl?: string;
}

export const TeamProfileSetupForm = ({
  mode,
  promptTeamName,
  initialNickname,
  initialAvatarUrl,
  initialProfileImgUrl,
}: TeamProfileSetupFormProps) => {
  const navigate = useNavigate();
  const { submit, isPending } = useTeamProfileSetupFlow();
  const { nickname, setNickname, avatarFile, avatarPreviewUrl, setAvatar, isDisabled } =
    useTeamProfileSetupForm({ initialNickname, initialAvatarUrl });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickAvatar = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) setAvatar(file);
    event.target.value = '';
  };

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
              initialProfileImgUrl,
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
        onClick={handlePickAvatar}
        className="press-feedback mb-7 flex size-28 items-center justify-center self-center overflow-hidden rounded-full border-[1.5px] border-gray-300"
      >
        {avatarPreviewUrl ? (
          <img src={avatarPreviewUrl} alt="" className="no-native-image size-full object-cover" />
        ) : (
          <CameraIcon className="h-4.5 w-5 text-black" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
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
