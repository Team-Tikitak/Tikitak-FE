import { json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

const PLAY_STORE_URL_PATTERN = /https:\/\/play\.google\.com\/store\/apps\/details/;

test.describe('초대 링크 진입', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: false, hasAgreedRequiredTerms: true, onboardingCompleted: true },
      teams: [],
    });
    await page.route('**/api/v1/invitation-links/*', async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill(
        json(
          wrap({
            teamId: 999,
            teamName: '초대받은팀',
            teamDescription: '설명',
            teamImgUrl: '',
            memberCount: 3,
          }),
        ),
      );
    });
    await page.context().route('https://play.google.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!doctype html><title>Google Play</title>',
      });
    });
  });

  test('초대 미리보기에서 스토어 이동 경로를 제공한다', async ({ page }, testInfo) => {
    await page.goto('/invite/test-token');

    await expect(page.getByText(/초대받은팀.*초대합니다/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: '설치하기' })).toBeVisible();

    if (testInfo.project.name !== 'mobile-chrome') return;

    await page.getByRole('button', { name: '티키탁에서 초대장 확인하기' }).click();
    await page.waitForURL(PLAY_STORE_URL_PATTERN, { timeout: 10_000 });
  });
});
