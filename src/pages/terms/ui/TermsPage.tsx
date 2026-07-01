import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { toTermsDoc } from '@/app/routes/paths';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { PermissionItem } from './PermissionItem';
import { TermsCheckRow } from './TermsCheckRow';
import { PERMISSIONS } from '../constants/permissions';
import { usePermissionRequests } from '../hooks/usePermissionRequests';
import { useTermsFlow } from '../hooks/useTermsFlow';

export const TermsPage = () => {
  const navigate = useNavigate();
  const { terms, allChecked, isSubmitting, toggleAll, toggle, submit, goBack } = useTermsFlow();
  const { grantedPermissions, pendingPermission, requestPermission, requestAllPermissions } =
    usePermissionRequests();

  const handleToggleAll = () => {
    const turningOn = !allChecked;
    toggleAll();
    if (turningOn) void requestAllPermissions();
  };

  return (
    <PageShell
      header={<Header showBackButton onBack={goBack} />}
      contentClassName="flex flex-col gap-10 px-5 pt-2"
      bottom={
        <Button
          variant="primary"
          disabled={!allChecked || isSubmitting}
          onClick={submit}
          className="disabled:opacity-30"
        >
          시작하기
        </Button>
      }
    >
      <section className="flex flex-col gap-2">
        <h2 className="title-1 text-black">
          서비스 이용을 위해
          <br />
          약관에 동의해 주세요
        </h2>
        <p className="body-1 text-gray-700">필수 항목에 동의하셔야 서비스를 이용할 수 있어요.</p>
      </section>

      <section className="flex flex-col gap-5">
        <TermsCheckRow
          variant="all"
          checked={allChecked}
          label="전체 동의하기"
          onToggle={handleToggleAll}
        />
        <TermsCheckRow
          variant="item"
          checked={terms.service}
          label="(필수) 서비스 이용약관"
          onToggle={() => toggle('service')}
          onDetailClick={() => navigate(toTermsDoc('service'))}
        />
        <TermsCheckRow
          variant="item"
          checked={terms.privacy}
          label="(필수) 개인정보 처리방침"
          onToggle={() => toggle('privacy')}
          onDetailClick={() => navigate(toTermsDoc('privacy'))}
        />
      </section>

      <section className="flex flex-col gap-6">
        <h3 className="body-2 text-gray-800">앱 접근 권한 안내</h3>
        {PERMISSIONS.map((permission) => (
          <PermissionItem
            key={permission.name}
            name={permission.name}
            description={permission.description}
            checked={grantedPermissions.has(permission.key)}
            disabled={pendingPermission === permission.key}
            onClick={() => void requestPermission(permission.key)}
          />
        ))}
      </section>
    </PageShell>
  );
};
