import { expect, test } from '@playwright/test';

test.describe('비인증 스모크', () => {
  test('루트 진입 시 스플래시 노출 후 로그인으로 전환된다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByLabel('tiki-tak!')).toBeVisible({ timeout: 3_000 });

    await page.waitForURL(/\/login$/, { timeout: 5_000 });
  });

  test('두 번째 진입 시 스플래시 없이 바로 로그인으로 이동한다', async ({ page, context }) => {
    await context.addInitScript(() => {
      window.sessionStorage.setItem('splash-seen', '1');
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.waitForURL(/\/login$/, { timeout: 2_000 });
  });

  test('로그인 페이지에 소셜 로그인 버튼 3종과 슬로건이 노출된다', async ({ page, context }) => {
    await context.addInitScript(() => {
      window.sessionStorage.setItem('splash-seen', '1');
    });

    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('button', { name: '카카오 로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: '구글 로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apple 로그인' })).toBeVisible();
    await expect(page.getByText('우리의 순간을 함께 남기는 공간')).toBeVisible();
  });
});

test.describe('PWA / SEO 메타', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.sessionStorage.setItem('splash-seen', '1');
    });
  });

  test('og:title 및 description meta가 설정되어 있다', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toMatch(/Tikitak/);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/모임|순간/);
  });

  test('manifest 링크가 존재한다', async ({ page }) => {
    test.skip(!process.env.CI, 'vite-plugin-pwa는 production build에서만 manifest 링크 주입');

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test('robots.txt 및 sitemap.xml이 정상 노출된다', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('User-agent');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBe(true);
    expect(await sitemap.text()).toContain('<urlset');
  });
});

test.describe('반응형 캔버스', () => {
  test('모바일 viewport에서 캔버스가 풀폭으로 채워진다', async ({ page, context }) => {
    await context.addInitScript(() => {
      window.sessionStorage.setItem('splash-seen', '1');
    });
    await page.goto('/login', { waitUntil: 'networkidle' });

    const root = page.locator('#root > div').first();
    const box = await root.boundingBox();
    const viewport = page.viewportSize();

    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (box && viewport) {
      expect(box.width).toBeGreaterThanOrEqual(viewport.width - 1);
    }
  });
});
