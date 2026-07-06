import { render, screen } from '@testing-library/react';
import { MemberCard } from './MemberCard';
import { isApplePrivateRelayEmail } from './memberEmail';

describe('MemberCard', () => {
  it('Apple private relay 이메일은 비공개 문구로 표시한다', () => {
    render(<MemberCard avatarSrc="" name="홍길동" email="t9h2rf79h7@privaterelay.appleid.com" />);

    expect(screen.getByText('이메일 비공개')).toBeInTheDocument();
    expect(screen.queryByText('t9h2rf79h7@privaterelay.appleid.com')).not.toBeInTheDocument();
  });

  it('일반 이메일은 그대로 표시한다', () => {
    render(<MemberCard avatarSrc="" name="홍길동" email="user@example.com" />);

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('Apple private relay 이메일을 대소문자와 공백에 관계없이 판별한다', () => {
    expect(isApplePrivateRelayEmail(' USER@PrivateRelay.AppleID.Com ')).toBe(true);
  });
});
