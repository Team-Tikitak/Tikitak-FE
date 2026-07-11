import { Component, type ErrorInfo, type ReactNode } from 'react';
import { recoverFromChunkLoadError } from '@/app/lib/chunkLoadRecovery';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  isRecovering: boolean;
}

export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { hasError: false, isRecovering: false };

  static getDerivedStateFromError(): GlobalErrorBoundaryState {
    return { hasError: true, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught', error, errorInfo);
    if (recoverFromChunkLoadError(error)) {
      this.setState({ isRecovering: true });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <div className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col items-center justify-center px-5">
            <p className="title-2 text-black">최신 버전을 불러오는 중이에요</p>
            <p className="body-1 mt-2 text-center text-gray-500">잠시만 기다려주세요</p>
          </div>
        );
      }

      return (
        <div className="mx-auto flex min-h-dvh w-full max-w-[393px] flex-col items-center justify-center px-5">
          <p className="title-2 text-black">문제가 발생했어요</p>
          <p className="body-1 mt-2 text-center text-gray-500">잠시 후 다시 시도해주세요</p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="button-2 bg-main-001 mt-8 rounded-[20px] px-6 py-3 text-white"
          >
            홈으로
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
