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
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalVisualViewport = window.visualViewport;
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
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: originalVisualViewport,
    });
    vi.restoreAllMocks();
  });

  it('requests a portrait feed-ratio camera stream to reduce 1x preview crop', async () => {
    const track = { stop: vi.fn() };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(getUserMediaMock).toHaveBeenCalledWith({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1440 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 3 / 4 },
          resizeMode: 'none',
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
          width: { ideal: 1440 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 3 / 4 },
        }),
        audio: false,
      });
    });
    expect(initialTrack.stop).toHaveBeenCalled();
  });

  it('normalizes the initial 1x preview when the WebView starts above 1x', async () => {
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      getSettings: vi.fn(() => ({ zoom: 1.2 })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByTestId('zoom-supported')).toHaveTextContent('true');
    });
    expect(track.applyConstraints).toHaveBeenCalledWith({
      advanced: [{ zoom: 1 }],
    });
  });

  it('does not force zoom constraints when the initial 1x preview is already at 1x', async () => {
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      getSettings: vi.fn(() => ({ zoom: 1 })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(screen.getByTestId('zoom-supported')).toHaveTextContent('true');
    });
    expect(track.applyConstraints).not.toHaveBeenCalled();
  });

  it('compensates 1x zoom for a full-cover portrait preview when the track supports wide zoom', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 393 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 852 });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { width: 393, height: 852 },
    });
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      getSettings: vi.fn(() => ({ zoom: 1 })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    render(<Harness />);

    await waitFor(() => {
      expect(track.applyConstraints).toHaveBeenCalled();
    });

    const zoom = track.applyConstraints.mock.calls[0]?.[0].advanced?.[0]?.zoom;
    expect(zoom).toBeGreaterThan(0.61);
    expect(zoom).toBeLessThan(0.62);
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

  it('starts zoom-out animation gently when returning from 2x to 1x', async () => {
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    const { rerender } = render(<Harness zoomLevel={2} />);

    await waitFor(() => {
      expect(track.applyConstraints).toHaveBeenCalledWith({
        advanced: [{ zoom: 2 }],
      });
    });

    rerender(<Harness zoomLevel={1} />);

    act(() => {
      rafCallback?.(0);
      rafCallback?.(16);
    });

    const lastCall = track.applyConstraints.mock.calls.at(-1)?.[0] as {
      advanced: Array<{ zoom: number }>;
    };
    expect(lastCall.advanced[0]?.zoom).toBeGreaterThan(1.98);
  });

  it('throttles zoom animation constraints to avoid preview frame drops', async () => {
    const track = {
      getCapabilities: vi.fn(() => ({ zoom: { min: 0.5, max: 10 } })),
      applyConstraints: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
    };
    getUserMediaMock.mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] });

    const { rerender } = render(<Harness zoomLevel={2} />);

    await waitFor(() => {
      expect(track.applyConstraints).toHaveBeenCalledWith({
        advanced: [{ zoom: 2 }],
      });
    });
    const initialApplyCount = track.applyConstraints.mock.calls.length;

    rerender(<Harness zoomLevel={1} />);

    act(() => {
      rafCallback?.(0);
      rafCallback?.(16);
      rafCallback?.(32);
      rafCallback?.(48);
      rafCallback?.(64);
    });

    expect(track.applyConstraints).toHaveBeenCalledTimes(initialApplyCount + 1);

    act(() => {
      rafCallback?.(80);
    });

    expect(track.applyConstraints).toHaveBeenCalledTimes(initialApplyCount + 2);
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
