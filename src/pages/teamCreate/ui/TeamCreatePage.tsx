import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { Button, CommentInputField, Header } from '@/shared/ui';
import { PageSection } from '@/shared/ui/PageSection/PageSection';

export const TeamCreatePage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const isDisabled = !name.trim() || !description.trim();

  return (
    <div>
      <AppLayout.Header>
        <Header title="팀 개설" showBackButton onBack={() => navigate(-1)} />
      </AppLayout.Header>

      <AppLayout.Content>
        <div className="flex flex-col gap-8 px-5 py-7">
          <PageSection title="팀 이름">
            <CommentInputField
              variant="comment"
              placeholder="우리 팀만의 재미있는 이름을 지어보세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </PageSection>

          <PageSection title="한줄 소개">
            <CommentInputField
              variant="comment"
              placeholder="팀을 소개해보세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </PageSection>
        </div>
      </AppLayout.Content>
      <AppLayout.Bottom>
        <Button
          variant="primary"
          disabled={isDisabled}
          className="mt-8"
          onClick={() => navigate(PATHS.TEAM_PROFILE_SETUP, { state: { name, description } })}
        >
          완료
        </Button>
      </AppLayout.Bottom>
    </div>
  );
};
