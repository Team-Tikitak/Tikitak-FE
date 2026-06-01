import { expect, test } from '@playwright/test';
import { json, mockApi, skipSplash, wrap } from './fixtures/api';

test.describe('약관 동의 → 온보딩 → 결과', () => {
  test.beforeEach(async ({ page }) => {
    await skipSplash(page);
    await mockApi(page, {
      me: {
        hasAgreedRequiredTerms: false,
        onboardingCompleted: false,
        profileCharacterType: null,
        hasTeam: false,
        activeTeamId: null,
      },
      agreements: { termsAgreed: false, privacyAgreed: false },
    });

    let agreed = false;
    await page.route('**/api/v1/me/agreements', async (route) => {
      if (route.request().method() === 'PUT') {
        agreed = true;
        await route.fulfill(json(wrap({ termsAgreed: true, privacyAgreed: true })));
      } else {
        await route.fulfill(
          json(
            wrap({
              termsAgreed: agreed,
              privacyAgreed: agreed,
              termsAgreedAt: '2026-05-01T00:00:00.000Z',
            }),
          ),
        );
      }
    });
  });

  test('약관 페이지가 정상 노출된다', async ({ page }) => {
    await page.goto('/terms');

    await expect(page.getByText('약관에 동의해 주세요')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('전체 동의하기')).toBeVisible();
  });

  test('전체 동의 후 다음 버튼 클릭 시 온보딩으로 이동한다', async ({ page }) => {
    await page.goto('/terms');

    await expect(page.getByText('전체 동의하기')).toBeVisible({ timeout: 10_000 });
    await page.getByText('전체 동의하기').click();

    await page.getByRole('button', { name: /다음|시작|계속/ }).click();

    await page.waitForURL(/\/onboarding$/, { timeout: 10_000 });
  });

  test('온보딩 결과 화면에 /me 의 이름이 표시된다', async ({ page }) => {
    await mockApi(page, {
      me: {
        name: '테스터',
        hasAgreedRequiredTerms: true,
        onboardingCompleted: false,
        profileCharacterType: null,
      },
    });

    await page.goto('/onboarding');

    await page.getByRole('button', { name: '시작하기' }).click({ timeout: 10_000 });

    // Q1, Q2: 각 질문의 첫 옵션 카드 클릭 (aria-pressed 속성이 옵션 카드 식별자)
    for (let i = 0; i < 2; i += 1) {
      await page.locator('button[aria-pressed]').first().click({ timeout: 10_000 });
    }

    await expect(page.getByText('테스터')).toBeVisible({ timeout: 10_000 });
  });
});
