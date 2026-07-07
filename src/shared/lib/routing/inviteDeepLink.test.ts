import { describe, expect, it } from 'vitest';
import { getInviteAcceptPathFromUrl, parseInviteToken } from './inviteDeepLink';

describe('inviteDeepLink', () => {
  it('허용된 유니버설 링크에서 초대 토큰을 읽는다', () => {
    expect(parseInviteToken('https://app.tikitak.space/invite/invite-token')).toBe('invite-token');
  });

  it('다른 host의 /invite 경로는 초대 링크로 처리하지 않는다', () => {
    expect(parseInviteToken('tikitak://other/invite/invite-token')).toBeNull();
    expect(parseInviteToken('https://example.com/invite/invite-token')).toBeNull();
  });

  it('커스텀 스킴 초대 링크에서 초대 경로를 만든다', () => {
    expect(getInviteAcceptPathFromUrl('tikitak://invite/invite-token')).toBe(
      '/invite/invite-token',
    );
  });
});
