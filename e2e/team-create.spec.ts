import { json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

test.describe('팀 생성', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, { me: { hasTeam: false }, teams: [] });
    await page.route('**/api/v1/teams', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      await route.fulfill(json(wrap({ teamName: '새로운팀' })));
    });
  });

  test('정보 입력 후 프로필 설정을 마치면 홈으로 이동한다', async ({ page }) => {
    await page.goto('/teams/new');

    await page.getByPlaceholder('우리 팀만의 재미있는 이름을 지어보세요').fill('새로운팀');
    await page.getByPlaceholder('팀을 소개해보세요').fill('테스트 소개');
    await page.getByRole('button', { name: '완료' }).click();

    await page.waitForURL(/\/teams\/new\/profile$/, { timeout: 10_000 });

    await page.getByPlaceholder('이름을 입력하세요').fill('테스터');
    // 전환 중 이전 페이지 "완료" 잔존 → 1개 될 때까지 대기
    await expect(page.getByRole('button', { name: '완료' })).toHaveCount(1);
    await page.getByRole('button', { name: '완료' }).click();

    await page.waitForURL(/\/home$/, { timeout: 10_000 });
  });
});
