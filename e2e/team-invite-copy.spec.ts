import { json, mockApi, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

test.beforeEach(async ({ page }) => {
  await mockApi(page, { me: { hasTeam: true, activeTeamId: 100 } });
  await page.route('**/api/v1/teams/100/invitation-link', (route) =>
    route.fulfill(json(wrap({ teamName: '테스트팀', inviteToken: 'test-token' }))),
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => {} },
    });
  });
});

test('초대 링크 복사 전후 QR과 링크 위치가 유지되고 체크가 나타난다', async ({ page }) => {
  await page.goto('/teams/100/invite');
  const link = page.getByRole('textbox', { name: '초대 링크' });
  const button = page.getByRole('button', { name: '초대 링크 복사' });
  const qr = page.getByRole('img', { name: '테스트팀 초대 QR 코드' });
  await expect(button).toBeEnabled();
  await expect(qr).toBeVisible();
  const before = await Promise.all([qr.boundingBox(), link.boundingBox(), button.boundingBox()]);

  await button.click();
  await expect(page.getByRole('status')).toHaveText('초대 링크를 복사했어요');
  const after = await Promise.all([qr.boundingBox(), link.boundingBox(), button.boundingBox()]);
  expect(after).toEqual(before);
  await expect(button.locator('svg')).toHaveCSS('animation-name', 'check-reveal');
  await expect(page.getByRole('status').locator('span')).toHaveCSS('animation-name', 'card-enter');
});

test('동작 줄이기 설정에서는 체크가 애니메이션 없이 표시된다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/teams/100/invite');
  const button = page.getByRole('button', { name: '초대 링크 복사' });
  await button.click();
  await expect(page.getByRole('status')).toHaveText('초대 링크를 복사했어요');
  await expect(button.locator('svg')).toHaveCSS('animation-name', 'none');
  await expect(page.getByRole('status').locator('span')).toHaveCSS('animation-name', 'none');
});
