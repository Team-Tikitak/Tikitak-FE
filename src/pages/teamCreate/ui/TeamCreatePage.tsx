import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { Button, CommentInputField, Header } from '@/shared/ui';
import { PageSection } from '@/shared/ui/PageSection/PageSection';
import { useTeamCreateForm } from '../hooks/useTeamCreateForm';

export const TeamCreatePage = () => {
  const navigate = useNavigate();
  const { name, setName, description, setDescription, isDisabled, draft } = useTeamCreateForm();

  return (
    <PageShell
      header={<Header title="팀 개설" showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col gap-8 px-5 py-7"
      bottom={
        <Button
          variant="primary"
          disabled={isDisabled}
          onClick={() => navigate(PATHS.TEAM_PROFILE_SETUP, { state: draft })}
        >
          완료
        </Button>
      }
    >
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
    </PageShell>
  );
};
