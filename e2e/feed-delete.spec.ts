import { json, mockApi, wrap } from './fixtures/api';
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

const author = {
  teamMemberId: 200,
  nickname: '테스터',
  profileImageUrl: '',
  anonymous: false,
  isAnonymous: false,
};

test.describe('피드 삭제', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [MOCK_TEAM],
    });

    // 피드 목록 (삭제 후 뒤로가기 도착지)
    await page.route(/\/api\/v1\/teams\/100\/feeds(\?.*)?$/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill(
          json(
            wrap({
              items: [
                {
                  feedId: 1,
                  type: 'GENERAL',
                  content: '삭제할 피드',
                  thumbnailImageUrl: 'https://placehold.co/400',
                  imageCount: 0,
                  place: { placeId: 'p1', name: '카페 마루', address: '서울' },
                  author,
                  commentCount: 0,
                  reactionSummary: { totalCount: 0, items: [] },
                  myReaction: null,
                  createdAt: '2026-05-01T00:00:00.000Z',
                },
              ],
              nextCursor: null,
            }),
          ),
        );
      } else {
        await route.continue();
      }
    });

    // 상세 조회 + 삭제
    await page.route('**/api/v1/teams/100/feeds/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill(json(wrap(null)));
      } else {
        await route.fulfill(
          json(
            wrap({
              feedId: 1,
              type: 'GENERAL',
              isMine: true,
              content: '삭제할 피드 본문',
              author,
              images: [],
              taggedMembers: [],
              place: { placeId: 'p1', name: '카페 마루', address: '서울' },
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-01T00:00:00.000Z',
            }),
          ),
        );
      }
    });
  });

  test('내 피드를 삭제하면 목록으로 돌아간다', async ({ page }) => {
    await page.goto('/feed');
    await page.goto('/feed/1');

    await page.getByRole('button', { name: '더보기' }).click({ timeout: 10_000 });
    await page.getByRole('button', { name: '삭제하기' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: '삭제하기' }).click();

    await page.waitForURL(/\/feed$/, { timeout: 10_000 });
  });
});
