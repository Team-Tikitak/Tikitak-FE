import { json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

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
  });

  test('초대 미리보기에서 초대장 확인 시 팀 프로필 설정으로 이동한다', async ({ page }) => {
    await page.goto('/invite/test-token');

    await expect(page.getByText(/초대받은팀.*초대합니다/)).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: '티키탁에서 초대장 확인하기' }).click();

    await page.waitForURL(/\/teams\/new\/profile$/, { timeout: 10_000 });
    await expect(page.getByPlaceholder('이름을 입력하세요')).toBeVisible();
  });
});
