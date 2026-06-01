import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('접근성 스모크', () => {
  test('로그인 페이지에 심각한 a11y 위반이 없다', async ({ page }) => {
    await page.addInitScript(() => window.sessionStorage.setItem('splash-seen', '1'));
    await page.goto('/login');
    await page.locator('button').first().waitFor({ timeout: 10_000 });

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(serious).toEqual([]);
  });
});
