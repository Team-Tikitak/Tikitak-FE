import { useState } from 'react';
import { Link, useRouteError } from 'react-router';
import { recoverFromChunkLoadError } from '@/app/lib/chunkLoadRecovery';
import { PATHS } from '@/app/routes/paths';

export const RootErrorBoundary = () => {
  const error = useRouteError();
  // 지연 초기화로 마운트당 한 번만 판정 — 재고침 시도는 sessionStorage 가드로 중복 방지
  const [isRecovering] = useState(() => {
    console.error('RootErrorBoundary', error);
    return recoverFromChunkLoadError(error);
  });

  if (isRecovering) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <p className="title-2 text-black">최신 버전을 불러오는 중이에요</p>
        <p className="body-1 mt-2 text-center text-gray-500">잠시만 기다려주세요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5">
      <p className="title-2 text-black">문제가 발생했어요</p>
      <p className="body-1 mt-2 text-center text-gray-500">잠시 후 다시 시도해주세요</p>
      <Link
        to={PATHS.ROOT}
        className="button-2 bg-main-001 mt-8 rounded-[20px] px-6 py-3 text-white"
      >
        홈으로
      </Link>
    </div>
  );
};
