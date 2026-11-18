import { type ComponentPropsWithRef } from 'react';
import { unlockAudio } from '@/shared/lib/sound/audioEngine';
import { useSoundStore } from '@/shared/stores/soundStore';

type SoundToggleProps = Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'children'>;

/** 소리 켜기/끄기. 모임이나 이동 중에 쓰는 앱이라 게임 화면에서 바로 끌 수 있게 둔다. */
export function SoundToggle({ className, ref, ...props }: SoundToggleProps) {
  const enabled = useSoundStore((state) => state.enabled);
  const toggleEnabled = useSoundStore((state) => state.toggleEnabled);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={enabled ? '소리 끄기' : '소리 켜기'}
      aria-pressed={enabled}
      onClick={() => {
        toggleEnabled();
        unlockAudio();
      }}
      className={className ?? 'flex size-6 items-center justify-center text-black'}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
        {enabled ? (
          <path
            d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : (
          <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
