import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { MAX_TEAM_DESCRIPTION_LENGTH, MAX_TEAM_NAME_LENGTH } from '@/shared/constants/team';
import { Button, CommentInputField, Header, PageSection } from '@/shared/ui';
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
          onClick={() =>
            navigate(PATHS.TEAM_PROFILE_SETUP, { state: { ...draft, mode: 'create' } })
          }
        >
          완료
        </Button>
      }
    >
      <PageSection title="팀 이름">
        <CommentInputField
          variant="comment"
          placeholder="우리 팀만의 재미있는 이름을 지어보세요"
          maxLength={MAX_TEAM_NAME_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </PageSection>

      <PageSection title="한줄 소개">
        <CommentInputField
          variant="comment"
          placeholder="팀을 소개해보세요"
          maxLength={MAX_TEAM_DESCRIPTION_LENGTH}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </PageSection>
    </PageShell>
  );
};
