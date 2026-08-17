import { afterEach, describe, expect, it, vi } from 'vitest';
import { setPostHogConsent } from './posthog';

const originalPostHog = window.posthog;

afterEach(() => {
  window.posthog = originalPostHog;
});

describe('setPostHogConsent', () => {
  it('동의 시 수집을 시작한다', () => {
    const optIn = vi.fn();
    const optOut = vi.fn();
    window.posthog = { opt_in_capturing: optIn, opt_out_capturing: optOut };

    setPostHogConsent(true);

    expect(optIn).toHaveBeenCalledOnce();
    expect(optOut).not.toHaveBeenCalled();
  });

  it('동의하지 않았거나 철회하면 수집을 중단한다', () => {
    const optIn = vi.fn();
    const optOut = vi.fn();
    window.posthog = { opt_in_capturing: optIn, opt_out_capturing: optOut };

    setPostHogConsent(false);

    expect(optIn).not.toHaveBeenCalled();
    expect(optOut).toHaveBeenCalledOnce();
  });
});
