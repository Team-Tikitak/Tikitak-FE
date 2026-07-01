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
    const { container } = render(<CameraView {...baseProps} isReady={false} />);

    expect(container.querySelector('video')).toHaveClass('opacity-0');
    expect(screen.queryByRole('button', { name: '카메라 전환' })).not.toBeInTheDocument();
  });

  it('shows the video and camera controls after the stream is ready', () => {
    const { container } = render(<CameraView {...baseProps} isReady />);

    expect(container.querySelector('video')).toHaveClass('opacity-100');
    expect(screen.getByRole('button', { name: '카메라 전환' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
