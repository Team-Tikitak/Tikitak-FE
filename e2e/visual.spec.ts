import { type Page, expect, test } from '@playwright/test';
import { blockThirdParty, mockApi, skipSplash } from './fixtures/api';

/**
 * 시각 회귀(VRT).
 * baseline은 고정된 Playwright Docker 이미지(visual.yml)에서만 생성·비교한다.
 * 갱신: visual.yml의 workflow_dispatch(update=true) 또는 동일 이미지에서 `--update-snapshots`.
 *
 * 로딩·blur-up·트랜지션 같은 transient/애니메이션 상태는 픽셀 비교에 부적합하므로
 * 결정적 화면(원격 이미지·애니메이션 없음)만 앵커로 둔다.
 */
test.describe('@visual 시각 회귀', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'VRT baseline은 chromium 한 세트만 유지',
  );

  const settle = async (page: Page) => {
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(300);
  };

  test('로그인 페이지', async ({ page }) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('우리의 순간을 함께 남기는 공간')).toBeVisible();
    await settle(page);

    await expect(page).toHaveScreenshot('login.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('홈 — 팀 없음 EmptyTeamView', async ({ page }) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await mockApi(page, { me: { hasTeam: false, activeTeamId: null }, teams: [] });
    await page.goto('/home', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('아직 참여한 팀이 없어요')).toBeVisible({ timeout: 10_000 });
    await settle(page);

    await expect(page).toHaveScreenshot('home-empty.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });
});
