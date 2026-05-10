import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { PATHS } from '@/app/routes/paths';

export const RootErrorBoundary = () => {
  const error = useRouteError();

  let title = '문제가 발생했어요';
  let description = '잠시 후 다시 시도해주세요';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    if (typeof error.data === 'string' && error.data) {
      description = error.data;
    }
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <p className="title-2 text-black">{title}</p>
      <p className="body-1 mt-2 text-center text-gray-500">{description}</p>
      <Link
        to={PATHS.ROOT}
        className="button-2 bg-main-001 mt-8 rounded-[20px] px-6 py-3 text-white"
      >
        홈으로
      </Link>
    </div>
  );
};
