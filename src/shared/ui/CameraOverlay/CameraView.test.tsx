import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CameraView } from './CameraView';

const baseProps = {
  videoRef: { current: null },
  error: null,
  onCapture: vi.fn(),
  onClose: vi.fn(),
  onToggleFacingMode: vi.fn(),
};

describe('CameraView', () => {
  it('keeps camera controls hidden until the stream is ready', () => {
    render(<CameraView {...baseProps} isReady={false} />);

    expect(screen.getByTestId('camera-preview')).toHaveClass('opacity-0');
    expect(screen.queryByRole('button', { name: '카메라 전환' })).not.toBeInTheDocument();
  });

  it('shows the video and camera controls after the stream is ready', () => {
    render(<CameraView {...baseProps} isReady />);

    expect(screen.getByTestId('camera-preview')).toHaveClass('opacity-100', 'object-cover');
    expect(screen.getByRole('button', { name: '카메라 전환' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('shows 1x and 2x zoom controls when the camera track supports zoom', () => {
    const onZoomChange = vi.fn();

    render(
      <CameraView {...baseProps} isReady zoomSupported zoomLevel={1} onZoomChange={onZoomChange} />,
    );

    expect(screen.getByRole('button', { name: '1배 줌' })).toHaveAttribute('aria-pressed', 'true');

    screen.getByRole('button', { name: '2배 줌' }).click();

    expect(onZoomChange).toHaveBeenCalledWith(2);
  });

  it('keeps the native preview layer visible behind the web overlay', () => {
    render(<CameraView {...baseProps} isReady nativePreview />);

    expect(screen.getByTestId('camera-view')).toHaveClass('bg-transparent');
    expect(screen.getByTestId('camera-preview')).toHaveClass('bg-transparent', 'opacity-100');
  });
});
