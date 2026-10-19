import { json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

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
  active: id === 100,
  isActive: id === 100,
});

test.describe('팀 전환 시트', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [team(100, '알파팀'), team(200, '베타팀')],
    });
    await page.route('**/api/v1/teams/*/daily-questions/**', async (route) =>
      route.fulfill(json(wrap({ questionId: null, content: '', answerDate: null }))),
    );
    await page.route('**/api/v1/teams/*/home/**', async (route) =>
      route.fulfill(json(wrap({ members: [] }))),
    );
  });

  test('헤더에서 팀을 바꾸면 활성 팀이 갱신된다', async ({ page }) => {
    await page.goto('/activity');

    await expect(page.getByRole('button', { name: '알파팀', exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole('button', { name: '알파팀', exact: true }).click();

    const betaItem = page.getByRole('button', { name: /베타팀/ });
    await expect(betaItem).toBeVisible();
    await betaItem.click();

    const feedback = page.getByRole('status').filter({ hasText: '팀을 변경했어요' });
    await expect(feedback).toBeVisible();
    await expect(feedback.locator('svg[aria-hidden="true"]')).toBeVisible();
    const header = page.locator('header').first();
    await expect
      .poll(async () => {
        const [toastBox, headerBox] = await Promise.all([
          feedback.boundingBox(),
          header.boundingBox(),
        ]);
        return toastBox && headerBox ? toastBox.y - (headerBox.y + headerBox.height) : -1;
      })
      .toBeGreaterThanOrEqual(0);

    await expect(page.getByRole('button', { name: '베타팀', exact: true })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('홈에서 팀을 바꾸면 완료 안내가 데일리 질문 아래에 표시된다', async ({ page }) => {
    await page.route('**/api/v1/teams/*/daily-questions/**', (route) =>
      route.fulfill(json(wrap({ questionId: 1, content: '오늘의 질문', answerFeedId: null }))),
    );
    await page.goto('/home');
    const banner = page.locator('[data-daily-question-banner]');
    await expect(banner).toBeVisible();
    await page.getByRole('button', { name: '알파팀', exact: true }).click();
    await page.getByRole('button', { name: /베타팀/ }).click();
    const feedback = page.getByRole('status').filter({ hasText: '팀을 변경했어요' });
    await expect(feedback).toBeVisible();
    await expect
      .poll(async () => {
        const [toastBox, bannerBox] = await Promise.all([
          feedback.boundingBox(),
          banner.boundingBox(),
        ]);
        return toastBox && bannerBox ? toastBox.y - (bannerBox.y + bannerBox.height) : -1;
      })
      .toBeGreaterThanOrEqual(0);
  });
});
