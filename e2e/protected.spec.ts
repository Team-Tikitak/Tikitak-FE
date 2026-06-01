import { expect, test } from '@playwright/test';

const PROTECTED_PATHS = ['/home', '/feed', '/activity', '/mypage'];

test.describe('보호 라우트 가드', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      window.sessionStorage.setItem('splash-seen', '1');
    });

    // refresh 실패 → 비인증 상태
    await page.route('**/api/v1/auth/token/refresh', async (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Unauthorized' }),
      }),
    );
  });

  for (const path of PROTECTED_PATHS) {
    test(`비인증 상태에서 ${path} 접근 시 로그인으로 리다이렉트된다`, async ({ page }) => {
      await page.goto(path);

      await page.waitForURL(/\/login$/, { timeout: 5_000 });
    });
  }

  test('존재하지 않는 경로는 NotFound 페이지로 응답한다', async ({ page, context }) => {
    await context.addInitScript(() => {
      window.sessionStorage.setItem('splash-seen', '1');
    });

    await page.goto('/this-page-does-not-exist-12345');

    await expect(page.getByText('404').first()).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('페이지를 찾을 수 없어요')).toBeVisible();
  });
});
