import { expect, test } from '@playwright/test';
import { mockApi, skipSplash } from './fixtures/api';

test.describe('바텀 네비게이션', () => {
  test.beforeEach(async ({ page }) => {
    await skipSplash(page);
    await mockApi(page, {
      me: { hasTeam: false, activeTeamId: null },
      teams: [],
    });
  });

  test('홈/피드/활동/마이 4탭 사이를 이동할 수 있다', async ({ page }) => {
    await page.goto('/home');

    await page.getByRole('button', { name: /피드/ }).click();
    await page.waitForURL(/\/feed$/);

    await page.getByRole('button', { name: /활동/ }).click();
    await page.waitForURL(/\/activity$/);

    await page.getByRole('button', { name: /마이/ }).click();
    await page.waitForURL(/\/mypage$/);

    await page.getByRole('button', { name: /홈/ }).click();
    await page.waitForURL(/\/home$/);
  });

  test('탭 전환 후 같은 탭으로 돌아오면 같은 페이지가 유지된다', async ({ page }) => {
    await page.goto('/feed');
    const initialUrl = page.url();

    await page.getByRole('button', { name: /활동/ }).click();
    await page.waitForURL(/\/activity$/);

    await page.getByRole('button', { name: /피드/ }).click();
    await page.waitForURL(/\/feed$/);

    expect(page.url()).toBe(initialUrl);
  });

  test('탭 전환은 짧게 페이드하고 빠른 연속 이동 후에도 마지막 탭을 표시한다', async ({ page }) => {
    await page.goto('/home');
    await page.getByRole('button', { name: /피드/ }).click();
    await page.waitForURL(/\/feed$/);

    await expect
      .poll(() =>
        page.locator('[data-ssgoi-transition="/feed"]').evaluate((element) =>
          element.getAnimations().some((animation) => {
            const effect = animation.effect as KeyframeEffect;
            return effect.getKeyframes().some((frame) => frame.opacity !== undefined);
          }),
        ),
      )
      .toBe(true);

    await page.getByRole('button', { name: /활동/ }).click();
    await page.getByRole('button', { name: /마이/ }).click();
    await expect(page).toHaveURL(/\/mypage$/);
    await expect(page.locator('[data-ssgoi-transition="/mypage"]')).toBeVisible();
  });

  test('동작 줄이기 설정에서는 탭 전환을 애니메이션 없이 표시한다', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/home');
    await page.getByRole('button', { name: /피드/ }).click();
    await page.waitForURL(/\/feed$/);
    await expect(page.locator('[data-ssgoi-transition="/feed"]')).toBeVisible();
    expect(
      await page
        .locator('[data-ssgoi-transition="/feed"]')
        .evaluate((element) =>
          element
            .getAnimations()
            .some((animation) =>
              (animation.effect as KeyframeEffect)
                .getKeyframes()
                .some((frame) => frame.opacity !== undefined),
            ),
        ),
    ).toBe(false);
  });
});
