import { describe, expect, it, beforeEach } from 'vitest';
import {
  consumeRedirectAfterLogin,
  isSafeInternalPath,
  REDIRECT_AFTER_LOGIN_KEY,
  saveRedirectAfterLogin,
} from './redirectAfterLogin';

describe('redirectAfterLogin', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('내부 경로만 저장하고 소비한다', () => {
    saveRedirectAfterLogin('/feed/12');

    expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBe('/feed/12');
    expect(consumeRedirectAfterLogin()).toBe('/feed/12');
    expect(sessionStorage.getItem(REDIRECT_AFTER_LOGIN_KEY)).toBeNull();
  });

  it('외부/제어 문자 경로는 거부한다', () => {
    expect(isSafeInternalPath('https://example.com')).toBe(false);
    expect(isSafeInternalPath('//example.com')).toBe(false);
    expect(isSafeInternalPath('/\\example.com')).toBe(false);
    expect(isSafeInternalPath('/feed/1\u0000')).toBe(false);
  });
});
