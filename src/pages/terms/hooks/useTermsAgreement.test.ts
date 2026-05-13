import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTermsAgreement } from './useTermsAgreement';

describe('useTermsAgreement', () => {
  it('초기 상태는 모든 항목이 false 이고 allChecked 도 false 이다', () => {
    const { result } = renderHook(() => useTermsAgreement());

    expect(result.current.terms).toEqual({ service: false, privacy: false });
    expect(result.current.allChecked).toBe(false);
  });

  it('toggle 은 개별 항목만 반전시킨다', () => {
    const { result } = renderHook(() => useTermsAgreement());

    act(() => {
      result.current.toggle('service');
    });

    expect(result.current.terms).toEqual({ service: true, privacy: false });
    expect(result.current.allChecked).toBe(false);
  });

  it('두 항목이 모두 켜지면 allChecked 가 true 가 된다', () => {
    const { result } = renderHook(() => useTermsAgreement());

    act(() => {
      result.current.toggle('service');
    });
    act(() => {
      result.current.toggle('privacy');
    });

    expect(result.current.allChecked).toBe(true);
  });

  it('toggleAll 은 두 항목을 한 번에 켜고 다시 끈다', () => {
    const { result } = renderHook(() => useTermsAgreement());

    act(() => {
      result.current.toggleAll();
    });
    expect(result.current.terms).toEqual({ service: true, privacy: true });
    expect(result.current.allChecked).toBe(true);

    act(() => {
      result.current.toggleAll();
    });
    expect(result.current.terms).toEqual({ service: false, privacy: false });
    expect(result.current.allChecked).toBe(false);
  });

  it('부분 선택 상태에서 toggleAll 은 모든 항목을 true 로 만든다', () => {
    const { result } = renderHook(() => useTermsAgreement());

    act(() => {
      result.current.toggle('service');
    });
    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.terms).toEqual({ service: true, privacy: true });
  });
});
