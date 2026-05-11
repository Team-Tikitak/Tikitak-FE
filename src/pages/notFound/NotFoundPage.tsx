import { Link } from 'react-router';
import { PATHS } from '@/app/routes/paths';

export const NotFoundPage = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <p className="title-1 text-black">404</p>
      <p className="title-2 mt-4 text-black">페이지를 찾을 수 없어요</p>
      <p className="body-1 mt-2 text-gray-500">요청하신 페이지가 존재하지 않습니다</p>
      <Link
        to={PATHS.ROOT}
        className="button-2 bg-main-001 mt-8 rounded-[20px] px-6 py-3 text-white"
      >
        홈으로
      </Link>
    </div>
  );
};
