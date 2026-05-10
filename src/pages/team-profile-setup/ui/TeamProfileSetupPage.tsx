import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { AppLayout } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import CameraIcon from '@/shared/assets/Icon/CameraIcon.svg?react';
import { Button, CommentInputField, Header } from '@/shared/ui';
import { PageSection } from '@/shared/ui/PageSection/PageSection';

export const TeamProfileSetupPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [nickname, setNickname] = useState('');

  if (!state?.name) return <Navigate to={PATHS.TEAM_CREATE} replace />;
  const teamName = state.name as string;
  const isDisabled = !nickname.trim();

  return (
    <div>
      <AppLayout.Header>
        <Header title="팀 개설" showBackButton onBack={() => navigate(-1)} />
      </AppLayout.Header>

      <AppLayout.Content>
        <div className="flex flex-col px-5 py-7">
          <h2 className="title-1 mb-15 text-start text-black">
            {teamName}에서
            <br />
            프로필을 어떻게 설정할까요?
          </h2>
          <button className="mb-7 flex size-28 items-center justify-center gap-2.5 self-center rounded-full border-[1.5px] border-gray-300">
            <CameraIcon className="h-4.5 w-5 text-black" />
          </button>
          <PageSection title="이름">
            <CommentInputField
              variant="comment"
              placeholder="이름을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </PageSection>
        </div>
      </AppLayout.Content>

      <AppLayout.Bottom>
        <Button variant="primary" disabled={isDisabled}>
          완료
        </Button>
      </AppLayout.Bottom>
    </div>
  );
};
