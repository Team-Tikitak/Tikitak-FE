import { expect, test } from '@playwright/test';
import { blockThirdParty, json, mockApi, skipSplash, wrap } from './fixtures/api';

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

test.describe('피드 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [MOCK_TEAM],
    });

    // 피드 목록 — 1개 아이템
    await page.route(/\/api\/v1\/teams\/100\/feeds(\?.*)?$/, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill(
          json(
            wrap({
              items: [
                {
                  feedId: 1,
                  type: 'GENERAL',
                  content: 'E2E 첫 피드',
                  thumbnailImageUrl: 'https://placehold.co/400',
                  imageCount: 1,
                  place: { placeId: 'p1', name: '카페 마루', address: '서울' },
                  author: {
                    teamMemberId: 200,
                    nickname: '테스터',
                    profileImageUrl: '',
                    anonymous: false,
                    isAnonymous: false,
                  },
                  commentCount: 0,
                  reactionSummary: { totalCount: 0, items: [] },
                  myReaction: null,
                  createdAt: '2026-05-01T00:00:00.000Z',
                },
              ],
              pageInfo: { hasNext: false, nextCursor: null },
            }),
          ),
        );
      } else {
        await route.continue();
      }
    });

    // 활동 페이지 home API
    await page.route('**/api/v1/teams/100/home/**', async (route) =>
      route.fulfill(json(wrap({ regions: [], picks: [], feeds: [], members: [] }))),
    );

    // 데일리 질문
    await page.route('**/api/v1/teams/100/daily-questions/**', async (route) =>
      route.fulfill(json(wrap({ questionId: null, content: '', answerDate: null }))),
    );
  });

  test('피드 페이지에 피드 1개와 목록 카운트가 표시된다', async ({ page }) => {
    await page.goto('/feed');
    await page.getByRole('button', { name: '리스트 보기' }).click();

    await expect(page.getByText('E2E 첫 피드')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('카페 마루')).toBeVisible();
  });

  test('피드 아이템 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    await page.route('**/api/v1/teams/100/feeds/1', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill(
          json(
            wrap({
              feedId: 1,
              type: 'GENERAL',
              content: 'E2E 첫 피드 본문',
              author: {
                teamMemberId: 200,
                nickname: '테스터',
                profileImageUrl: '',
                anonymous: false,
                isAnonymous: false,
              },
              images: [],
              taggedMembers: [],
              place: { placeId: 'p1', name: '카페 마루', address: '서울' },
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-01T00:00:00.000Z',
            }),
          ),
        );
      } else {
        await route.continue();
      }
    });

    await page.goto('/feed');
    await page.getByRole('button', { name: '리스트 보기' }).click();

    await page.getByText('E2E 첫 피드').click();

    await page.waitForURL(/\/feed\/1$/, { timeout: 10_000 });
  });
});
