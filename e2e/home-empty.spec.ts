import { expect, test } from '@playwright/test';
import { mockApi, skipSplash } from './fixtures/api';

test.describe('팀 없는 사용자 — EmptyTeamView', () => {
  test.beforeEach(async ({ page }) => {
    await skipSplash(page);
    await mockApi(page, {
      me: { hasTeam: false, activeTeamId: null },
      teams: [],
    });
  });

  test('홈에서 "아직 참여한 팀이 없어요" 가이드가 노출된다', async ({ page }) => {
    await page.goto('/home');

    await expect(page.getByText('아직 참여한 팀이 없어요')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: '팀 개설하기' })).toBeVisible();
  });

  test('피드 페이지에서도 동일한 EmptyTeamView가 노출된다', async ({ page }) => {
    await page.goto('/feed');

    await expect(page.getByText('아직 참여한 팀이 없어요')).toBeVisible({ timeout: 10_000 });
  });

  test('활동 페이지에서도 동일한 EmptyTeamView가 노출된다', async ({ page }) => {
    await page.goto('/activity');

    await expect(page.getByText('아직 참여한 팀이 없어요')).toBeVisible({ timeout: 10_000 });
  });

  test('"팀 개설하기" 클릭 시 팀 개설 페이지로 이동한다', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('button', { name: '팀 개설하기' }).click();

    await page.waitForURL(/\/teams\/new$/, { timeout: 5_000 });
  });
});
