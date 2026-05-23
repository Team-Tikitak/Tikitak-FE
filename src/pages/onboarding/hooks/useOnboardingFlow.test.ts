import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOnboardingFlow } from './useOnboardingFlow';

describe('useOnboardingFlow', () => {
  it('초기 상태는 character-preview 이고 답변은 비어있다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    expect(result.current.step).toBe('character-preview');
    expect(result.current.answers).toEqual({});
    expect(result.current.canGoBack).toBe(false);
  });

  it('goTo 로 step 을 이동하면 canGoBack 이 갱신된다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
      result.current.goTo('q1');
    });

    expect(result.current.step).toBe('q1');
    expect(result.current.canGoBack).toBe(true);
  });

  it('character-preview 로 돌아가면 누적된 답변이 초기화된다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
      result.current.recordAnswerAndAdvance('q1', 'A');
    });
    expect(result.current.answers).toEqual({ q1: 'A' });

    act(() => {
      result.current.goTo('character-preview');
    });
    expect(result.current.answers).toEqual({});
  });

  it('recordAnswerAndAdvance 는 답변을 누적하며 다음 step 으로 진행한다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
      result.current.recordAnswerAndAdvance('q1', 'A');
    });
    expect(result.current.step).toBe('q2');

    act(() => {
      result.current.recordAnswerAndAdvance('q2', 'B');
    });
    expect(result.current.step).toBe('result');
    expect(result.current.answers).toEqual({ q1: 'A', q2: 'B' });
  });

  it('canGoBack 이 false 일 때 goBack 은 step 을 바꾸지 않는다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
      result.current.goBack();
    });

    expect(result.current.step).toBe('character-preview');
  });

  it('goBack 은 직전 step 으로 되돌아간다', () => {
    const { result } = renderHook(() => useOnboardingFlow());

    act(() => {
      result.current.goTo('q2');
    });
    expect(result.current.step).toBe('q2');

    act(() => {
      result.current.goBack();
    });
    expect(result.current.step).toBe('q1');
  });
});
