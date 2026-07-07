import { cn } from '@/shared/lib';
import { Switch } from '../../Switch';
import { type BottomSheetProps, BottomSheet } from '../BottomSheet';

export interface NotificationSettingsSheetProps extends Omit<
  BottomSheetProps,
  'children' | 'title'
> {
  supported: boolean;
  enabled: boolean | null;
  onToggle: () => void;
}

export function NotificationSettingsSheet({
  supported,
  enabled,
  onToggle,
  contentClassName,
  ...props
}: NotificationSettingsSheetProps) {
  return (
    <BottomSheet
      title="알림 설정"
      contentClassName={cn('pb-[calc(24px+env(safe-area-inset-bottom))]', contentClassName)}
      {...props}
    >
      <div className="flex items-center justify-between py-2">
        <div className="flex flex-col gap-1">
          <p className="body-8 text-black">푸시 알림</p>
          <p className="body-11 text-gray-500">
            {supported
              ? '팀원들의 댓글과 오늘의 질문 소식 알림을 받아요'
              : '이 기기에서는 알림을 사용할 수 없어요'}
          </p>
        </div>
        <Switch
          checked={supported ? (enabled ?? false) : false}
          disabled={!supported || enabled === null}
          onCheckedChange={onToggle}
          aria-label="푸시 알림"
        />
      </div>
    </BottomSheet>
  );
}
