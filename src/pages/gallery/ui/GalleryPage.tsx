import { useNavigate } from 'react-router';
import { PageShell } from '@/app/layout';
import { Header } from '@/shared/ui';

export const GalleryPage = () => {
  const navigate = useNavigate();

  return (
    <PageShell
      header={<Header title="사진 선택" showBackButton onBack={() => navigate(-1)} />}
      contentClassName="grid grid-cols-3 content-start gap-1 mt-7"
    >
      <> {/* TODO: 앱 권한 획득 후 갤러리 사진 목록 로드 */}</>
    </PageShell>
  );
};
