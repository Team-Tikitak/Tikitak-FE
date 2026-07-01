import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCameraStream } from './useCameraStream';

const Harness = () => {
  const { videoRef, isReady, stopStream } = useCameraStream(false);

  return (
    <>
      <video ref={videoRef} />
      <span data-testid="ready">{String(isReady)}</span>
      <button type="button" onClick={stopStream}>
        stop
      </button>
    </>
  );
};

describe('useCameraStream', () => {
  const originalNavigator = globalThis.navigator;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  let getUserMediaMock: ReturnType<typeof vi.fn>;
  let playSpy: ReturnType<typeof vi.spyOn>;
  let rafCallback: FrameRequestCallback | null;
  let cancelAnimationFrameMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rafCallback = null;
    getUserMediaMock = vi.fn();
    cancelAnimationFrameMock = vi.fn();
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: getUserMediaMock,
      },
    });
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        rafCallback = callback;
        return 7;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrameMock);
    playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator);
    vi.stubGlobal('requestAnimationFrame', originalRequestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', originalCancelAnimationFrame);
    vi.restoreAllMocks();
  });

  it('does not mark the stream ready after stopStream cancels a pending ready frame', async () => {
    const track = { stop: vi.fn() };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(playSpy).toHaveBeenCalled();
      expect(rafCallback).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('button', { name: 'stop' }));

    expect(cancelAnimationFrameMock).toHaveBeenCalledWith(7);
    expect(track.stop).toHaveBeenCalled();

    act(() => {
      rafCallback?.(0);
    });

    expect(screen.getByTestId('ready')).toHaveTextContent('false');
  });
});
