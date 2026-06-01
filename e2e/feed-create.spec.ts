import { json, mockApi, mockMediaUpload, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

const MOCK_TEAM = {
  teamId: 100,
  teamMemberId: 200,
  teamName: 'E2E 팀',
  description: '테스트 팀',
  role: 'OWNER' as const,
  nickname: '테스터',
  profileImgUrl: '',
  memberCount: 1,
  joinedAt: '2026-05-01T00:00:00.000Z',
  active: true,
  isActive: true,
};

test.describe('피드 작성', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [MOCK_TEAM],
    });
    await mockMediaUpload(page);
    await page.route(/\/api\/v1\/teams\/100\/members$/, async (route) =>
      route.fulfill(json(wrap({ members: [] }))),
    );
    await page.route(/\/api\/v1\/teams\/100\/feeds(\?.*)?$/, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill(json(wrap({ feedId: 1 })));
      } else {
        await route.fulfill(
          json(wrap({ items: [], pageInfo: { hasNext: false, nextCursor: null } })),
        );
      }
    });
  });

  test('사진을 추가하고 공유하면 목록으로 돌아간다', async ({ page }) => {
    await page.goto('/feed');
    await page.goto('/feed/new');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'photo.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
    });

    const shareButton = page.getByRole('button', { name: '공유하기' });
    await expect(shareButton).toBeEnabled({ timeout: 10_000 });
    await shareButton.click();

    await page.waitForURL(/\/feed$/, { timeout: 10_000 });
  });
});
