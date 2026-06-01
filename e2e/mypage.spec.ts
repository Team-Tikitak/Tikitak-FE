import { json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

const makeMembers = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    teamMemberId: i + 1,
    nickname: `멤버${i + 1}`,
    role: i === 0 ? 'OWNER' : 'MEMBER',
    profileImgUrl: '',
  }));

const makeTeam = (overrides: Record<string, unknown> = {}) => ({
  teamId: 100,
  teamMemberId: 1,
  teamName: '티키탁 전시회',
  description: '테스트 팀',
  role: 'OWNER' as const,
  nickname: '테스터',
  profileImgUrl: '',
  memberCount: 61,
  joinedAt: '2026-05-01T00:00:00.000Z',
  active: true,
  isActive: true,
  ...overrides,
});

test.describe('마이페이지 팀 카드', () => {
  test('멤버가 많으면 아바타 일부와 초과 인원 +N 칩이 표시된다', async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [makeTeam({ memberCount: 61 })],
    });
    await page.route(/\/api\/v1\/teams\/100\/members$/, async (route) =>
      route.fulfill(json(wrap({ members: makeMembers(61) }))),
    );

    await page.goto('/mypage');

    await expect(page.getByText('티키탁 전시회')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('61명 참여 중')).toBeVisible();
    await expect(page.getByText('+55')).toBeVisible();
  });

  test('멤버가 6명 이하면 +N 칩이 없다', async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [makeTeam({ memberCount: 3 })],
    });
    await page.route(/\/api\/v1\/teams\/100\/members$/, async (route) =>
      route.fulfill(json(wrap({ members: makeMembers(3) }))),
    );

    await page.goto('/mypage');

    await expect(page.getByText('3명 참여 중')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/^\+\d+$/)).toHaveCount(0);
  });
});
