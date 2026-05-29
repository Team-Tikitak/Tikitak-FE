import type { Page } from '@playwright/test';

type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';
type ProfileCharacterType =
  | 'TAK_LEADER'
  | 'TAK_SPARK'
  | 'TAK_BURNER'
  | 'TAK_BUILDER'
  | 'TAK_FREE'
  | 'TAK_CARE';

export interface MockMe {
  memberId: number;
  email: string;
  name: string;
  socialProvider: SocialProvider;
  status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN';
  hasAgreedRequiredTerms: boolean;
  onboardingCompleted: boolean;
  profileCharacterType: ProfileCharacterType | null;
  activeTeamId: number | null;
  hasTeam: boolean;
  createdAt: string;
}

export interface MockTeam {
  teamId: number;
  teamMemberId: number;
  teamName: string;
  description: string;
  role: 'OWNER' | 'MEMBER';
  nickname: string;
  profileImgUrl: string;
  memberCount: number;
  joinedAt: string;
  active: boolean;
  isActive: boolean;
}

export interface MockAgreements {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  termsAgreedAt: string;
}

export const DEFAULT_ME: MockMe = {
  memberId: 1,
  email: 'test@tikitak.space',
  name: '테스트',
  socialProvider: 'GOOGLE',
  status: 'ACTIVE',
  hasAgreedRequiredTerms: true,
  onboardingCompleted: true,
  profileCharacterType: 'TAK_LEADER',
  activeTeamId: null,
  hasTeam: false,
  createdAt: '2026-05-01T00:00:00.000Z',
};

const wrap = <T>(data: T) =>
  JSON.stringify({ success: true, data, timestamp: new Date().toISOString(), status: 200 });

const json = (body: string) => ({ status: 200, contentType: 'application/json', body });

interface MockApiOptions {
  me?: Partial<MockMe>;
  teams?: MockTeam[];
  agreements?: Partial<MockAgreements>;
}

export const mockApi = async (page: Page, opts: MockApiOptions = {}): Promise<void> => {
  const me: MockMe = { ...DEFAULT_ME, ...opts.me };
  const teams: MockTeam[] = opts.teams ?? [];
  const agreements: MockAgreements = {
    termsAgreed: me.hasAgreedRequiredTerms,
    privacyAgreed: me.hasAgreedRequiredTerms,
    termsAgreedAt: '2026-05-01T00:00:00.000Z',
    ...opts.agreements,
  };

  await page.route('**/api/v1/auth/token/refresh', async (route) =>
    route.fulfill(json(wrap({ accessToken: 'mock-access-token' }))),
  );

  await page.route('**/api/v1/auth/logout', async (route) => route.fulfill(json(wrap(null))));

  await page.route('**/api/v1/me', async (route) => route.fulfill(json(wrap(me))));

  await page.route('**/api/v1/me/teams', async (route) => route.fulfill(json(wrap({ teams }))));

  await page.route('**/api/v1/me/agreements', async (route) =>
    route.fulfill(json(wrap(agreements))),
  );

  await page.route('**/api/v1/me/active-team', async (route) => route.fulfill(json(wrap(null))));

  await page.route('**/api/v1/me/onboarding', async (route) =>
    route.fulfill(json(wrap({ onboardingCompleted: true, profileCharacterType: 'TAK_LEADER' }))),
  );
};

export const skipSplash = async (page: Page): Promise<void> => {
  await page.context().addInitScript(() => {
    window.sessionStorage.setItem('splash-seen', '1');
  });
};

export const seedAccessToken = async (page: Page): Promise<void> => {
  // zustand 메모리 저장이라 페이지 초기화 시점에 미리 채울 수 없음 — refresh mock으로 대신함
  await page.context().addInitScript(() => {
    window.sessionStorage.setItem('tikitak:authed', '1');
  });
};
