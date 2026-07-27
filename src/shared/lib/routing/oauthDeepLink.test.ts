import { describe, expect, it } from 'vitest';
import { parseLoginCode } from './oauthDeepLink';

describe('oauthDeepLink', () => {
  it('앱 흐름 콜백 딥링크에서 loginCode를 읽는다', () => {
    expect(parseLoginCode('tikitak://oauth/callback?loginCode=login-code')).toBe('login-code');
  });

  it('허용된 host의 https 콜백에서도 loginCode를 읽는다', () => {
    expect(parseLoginCode('https://app.tikitak.space/oauth/callback?loginCode=login-code')).toBe(
      'login-code',
    );
  });

  it('다른 host의 콜백 경로는 처리하지 않는다', () => {
    expect(parseLoginCode('tikitak://other/callback?loginCode=evil')).toBeNull();
    expect(parseLoginCode('https://example.com/oauth/callback?loginCode=evil')).toBeNull();
  });

  it('콜백 경로가 아닌 딥링크는 처리하지 않는다', () => {
    expect(parseLoginCode('tikitak://anything?loginCode=evil')).toBeNull();
    expect(parseLoginCode('tikitak://oauth/other?loginCode=evil')).toBeNull();
    expect(parseLoginCode('tikitak://invite/invite-token?loginCode=evil')).toBeNull();
  });

  it('loginCode가 없는 정상 콜백은 null이다', () => {
    expect(parseLoginCode('tikitak://oauth/callback')).toBeNull();
  });

  it('잘못된 URL 문자열은 처리하지 않는다', () => {
    expect(parseLoginCode('not a url')).toBeNull();
  });
});
