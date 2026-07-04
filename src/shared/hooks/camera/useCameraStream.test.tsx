import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCameraStream, type CameraZoomLevel } from './useCameraStream';

const Harness = ({ zoomLevel = 1 }: { zoomLevel?: CameraZoomLevel }) => {
  const { videoRef, isReady, isZoomSupported, stopStream } = useCameraStream(
    false,
    'environment',
    zoomLevel,
  );

  return (
    <>
      <video ref={videoRef} />
      <span data-testid="ready">{String(isReady)}</span>
      <span data-testid="zoom-supported">{String(isZoomSupported)}</span>
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
  let enumerateDevicesMock: ReturnType<typeof vi.fn>;
  let playSpy: ReturnType<typeof vi.spyOn>;
  let rafCallback: FrameRequestCallback | null;
  let cancelAnimationFrameMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rafCallback = null;
    getUserMediaMock = vi.fn();
    enumerateDevicesMock = vi.fn().mockResolvedValue([]);
    cancelAnimationFrameMock = vi.fn();
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: getUserMediaMock,
        enumerateDevices: enumerateDevicesMock,
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

  it('requests a wide camera stream without forcing a portrait crop', async () => {
    const track = { stop: vi.fn() };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(getUserMediaMock).toHaveBeenCalledWith({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
          resizeMode: 'none',
          advanced: [{ zoom: 1 }],
        },
        audio: false,
      });
    });
  });

  it('reopens the stream with a preferred non-telephoto back camera when available', async () => {
    const initialTrack = {
      getSettings: vi.fn(() => ({ deviceId: 'telephoto-camera' })),
      stop: vi.fn(),
    };
    const preferredTrack = {
      getCapabilities: vi.fn(() => ({})),
      applyConstraints: vi.fn(),
      stop: vi.fn(),
    };
    getUserMediaMock
      .mockResolvedValueOnce({
        getTracks: () => [initialTrack],
        getVideoTracks: () => [initialTrack],
      })
      .mockResolvedValueOnce({
        getTracks: () => [preferredTrack],
        getVideoTracks: () => [preferredTrack],
      });
    enumerateDevicesMock.mockResolvedValue([
      {
        kind: 'videoinput',
        deviceId: 'telephoto-camera',
        label: 'Back Telephoto Camera',
      },
      {
        kind: 'videoinput',
        deviceId: 'wide-camera',
        label: 'Back Wide Camera',
      },
    ]);

    render(<Harness />);

    await waitFor(() => {
      expect(getUserMediaMock).toHaveBeenCalledTimes(2);
      expect(getUserMediaMock).toHaveBeenLastCalledWith({
        video: expect.objectContaining({
          deviceId: { exact: 'wide-camera' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 16 / 9 },
        }),
        audio: false,
      });
    });
    expect(initialTrack.stop).toHaveBeenCalled();
  });

  it('keeps supported camera zoom at 1x even when the lens exposes a 0.5x minimum', async () => {
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(track.applyConstraints).toHaveBeenCalledWith({
        advanced: [{ zoom: 1 }],
      });
    });
  });

  it('applies 2x zoom when the selected level is supported', async () => {
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness zoomLevel={2} />);

    await waitFor(() => {
      expect(track.applyConstraints).toHaveBeenCalledWith({
        advanced: [{ zoom: 2 }],
      });
    });
    expect(screen.getByTestId('zoom-supported')).toHaveTextContent('true');
  });

  it('does not mark the stream ready after stopStream cancels a pending ready frame', async () => {
    const track = { stop: vi.fn() };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

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
