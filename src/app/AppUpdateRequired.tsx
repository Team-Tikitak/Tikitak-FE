import { Button } from '@/shared/ui';

interface AppUpdateRequiredProps {
  message: string;
  onUpdate: () => void;
}

export const AppUpdateRequired = ({ message, onUpdate }: AppUpdateRequiredProps) => {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-[24px] leading-[1.35] font-bold text-gray-900">업데이트가 필요합니다</h1>
      <p className="mt-3 text-[16px] leading-[1.55] text-gray-600">{message}</p>
      <Button type="button" className="mt-8 w-full max-w-[320px]" onClick={onUpdate}>
        업데이트
      </Button>
    </main>
  );
};
