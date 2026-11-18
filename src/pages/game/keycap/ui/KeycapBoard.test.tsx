import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KeycapBoard } from './KeycapBoard';
import { KEY_COUNT, type Keycap } from '../lib/keycapEngine';

const idleKeys = (): Keycap[] =>
  Array.from({ length: KEY_COUNT }, () => ({
    phase: 'idle' as const,
    owner: null,
    botAt: 0,
    releaseAt: 0,
  }));

const firstKey = () => screen.getAllByRole('button', { name: '키캡' })[0];

describe('KeycapBoard 입력', () => {
  it('포인터를 누르면 onPress만 호출하고, 떼면 onRelease를 호출한다', () => {
    const onPress = vi.fn();
    const onRelease = vi.fn();
    render(<KeycapBoard keys={idleKeys()} onPress={onPress} onRelease={onRelease} />);

    fireEvent.pointerDown(firstKey());

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(0);
    expect(onRelease).not.toHaveBeenCalled();

    fireEvent.pointerUp(firstKey());

    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(onRelease).toHaveBeenCalledWith(0);
  });

  it('키보드(detail 0)로 활성화하면 onPress와 onRelease를 연달아 호출한다', () => {
    const onPress = vi.fn();
    const onRelease = vi.fn();
    render(<KeycapBoard keys={idleKeys()} onPress={onPress} onRelease={onRelease} />);

    fireEvent.click(firstKey(), { detail: 0 });

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onRelease).toHaveBeenCalledTimes(1);
    expect(onPress.mock.invocationCallOrder[0]).toBeLessThan(onRelease.mock.invocationCallOrder[0]);
  });

  it('회귀: 터치나 마우스 클릭(detail 1)은 포인터가 이미 처리해서 click에서는 아무것도 호출하지 않는다', () => {
    const onPress = vi.fn();
    const onRelease = vi.fn();
    render(<KeycapBoard keys={idleKeys()} onPress={onPress} onRelease={onRelease} />);

    fireEvent.click(firstKey(), { detail: 1 });

    expect(onPress).not.toHaveBeenCalled();
    expect(onRelease).not.toHaveBeenCalled();
  });

  it('한 번 터치하면 onPress가 한 번만 불린다 (pointerdown 뒤 click이 이어져도)', () => {
    const onPress = vi.fn();
    render(<KeycapBoard keys={idleKeys()} onPress={onPress} />);

    fireEvent.pointerDown(firstKey());
    fireEvent.click(firstKey(), { detail: 1 });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
