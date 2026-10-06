import { DEFAULT_ME, json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';
import type { Page } from '@playwright/test';

const CACHE_KEY = 'tikitak-query-cache';

const team = (id: number, name: string) => ({
  teamId: id,
  teamMemberId: id,
  teamName: name,
  description: `${name} 설명`,
  role: 'OWNER' as const,
  nickname: '테스터',
  profileImgUrl: '',
  memberCount: 1,
  joinedAt: '2026-05-01T00:00:00.000Z',
  active: true,
  isActive: true,
});

const mockTeamPages = async (page: Page) => {
  await page.route('**/api/v1/teams/*/daily-questions/**', async (route) =>
    route.fulfill(json(wrap({ questionId: null, content: '', answerDate: null }))),
  );
  await page.route('**/api/v1/teams/*/home/**', async (route) =>
    route.fulfill(json(wrap({ members: [] }))),
  );
};

// 저장된 영속 캐시의 쿼리 키 목록 (예: ['user/me'])
const readPersistedKeys = (page: Page) =>
  page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [] as string[];
    return JSON.parse(raw).clientState.queries.map((query: { queryKey: unknown[] }) =>
      query.queryKey.join('/'),
    );
  }, CACHE_KEY);

const readPersistedMemberId = (page: Page) =>
  page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const me = JSON.parse(raw).clientState.queries.find(
      (query: { queryKey: unknown[] }) => query.queryKey.join('/') === 'user/me',
    );
    return me?.state.data.memberId ?? null;
  }, CACHE_KEY);

// persister가 1초 throttle이라 저장될 때까지 기다린다
const waitUntilPersisted = (page: Page) =>
  expect.poll(() => readPersistedKeys(page), { timeout: 5_000 }).toContain('user/me');

test.describe('쿼리 캐시 영속화', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [team(100, '알파팀')],
    });
    await mockTeamPages(page);
  });

  test('재실행(메모리 캐시 소실) 후 /me 응답이 느려도 화면이 먼저 뜬다', async ({ page }) => {
    await page.goto('/activity');
    await expect(page.getByRole('button', { name: '알파팀', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await waitUntilPersisted(page);

    // 콜드 스타트에서 /me, 약관 응답이 오래 걸리는 상황
    await page.route('**/api/v1/me', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 6_000));
      await route
        .fulfill(json(wrap({ ...DEFAULT_ME, hasTeam: true, activeTeamId: 100 })))
        .catch(() => undefined);
    });
    await page.route('**/api/v1/me/agreements', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 6_000));
      await route
        .fulfill(
          json(
            wrap({ termsAgreed: true, privacyAgreed: true, termsAgreedAt: '2026-05-01T00:00:00Z' }),
          ),
        )
        .catch(() => undefined);
    });

    await page.reload();

    await expect(page.getByRole('button', { name: '알파팀', exact: true })).toBeVisible({
      timeout: 3_000,
    });
  });

  test('로그아웃하면 저장된 영속 캐시가 비워진다', async ({ page }) => {
    await page.goto('/activity');
    await expect(page.getByRole('button', { name: '알파팀', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await waitUntilPersisted(page);

    await page.goto('/mypage');
    await page.getByText('로그아웃', { exact: true }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    await expect.poll(() => readPersistedKeys(page), { timeout: 5_000 }).toEqual([]);
  });

  test('세션이 만료된 채 재실행하면 이전 계정 캐시를 지우고, 다른 계정으로 로그인해도 섞이지 않는다', async ({
    page,
  }) => {
    await page.goto('/activity');
    await expect(page.getByRole('button', { name: '알파팀', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await waitUntilPersisted(page);
    expect(await readPersistedMemberId(page)).toBe(DEFAULT_ME.memberId);

    // refresh token 만료 상태로 재실행
    await page.route('**/api/v1/auth/token/refresh', async (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, status: 401, message: 'expired' }),
      }),
    );
    await page.reload();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    await expect.poll(() => readPersistedKeys(page), { timeout: 5_000 }).toEqual([]);

    // 다른 계정(memberId 2)이 OAuth 콜백으로 로그인
    await page.route('**/api/v1/auth/token/refresh', async (route) =>
      route.fulfill(json(wrap({ accessToken: 'account-b-token' }))),
    );
    await page.route('**/api/v1/me', async (route) =>
      route.fulfill(json(wrap({ ...DEFAULT_ME, memberId: 2, hasTeam: true, activeTeamId: 200 }))),
    );
    await page.route('**/api/v1/me/teams', async (route) =>
      route.fulfill(json(wrap({ teams: [team(200, '베타팀')] }))),
    );
    await page.goto('/oauth/callback?accessToken=account-b-token');

    await expect(page.getByRole('button', { name: '베타팀', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole('button', { name: '알파팀', exact: true })).toHaveCount(0);
    await expect.poll(() => readPersistedMemberId(page), { timeout: 5_000 }).toBe(2);
  });
});
