import { json, mockApi, seedHintSeen, stubImages, wrap } from './fixtures/api';
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
    await seedHintSeen(page);
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
              pageInfo: { hasNext: false, nextCursor: null },
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

  test('넓은 화면에서 두 번째 사진을 보고 삭제하면 그 사진이 깨진다', async ({ page }) => {
    // 콘텐츠가 가운데 정렬되는 폭 — 이전 사진이 왼쪽 여백에 걸쳐 뷰포트 안에 남는 조건
    await page.setViewportSize({ width: 700, height: 900 });
    await stubImages(page);

    let releaseDelete = () => {};
    const deleteHeld = new Promise<void>((resolve) => {
      releaseDelete = resolve;
    });
    await page.route('**/api/v1/teams/100/feeds/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        // 깨지는 상태를 확인할 때까지 삭제 응답(→ 목록 복귀)을 보류한다
        await deleteHeld;
        await route.fulfill(json(wrap(null))).catch(() => undefined);
        return;
      }
      await route.fulfill(
        json(
          wrap({
            feedId: 1,
            type: 'GENERAL',
            isMine: true,
            content: '사진 두 장 피드',
            author,
            images: [
              {
                feedImageId: 10,
                imageUrl: 'first.jpg',
                heroPreviewUrl: 'first-p.jpg',
                orderIndex: 0,
              },
              {
                feedImageId: 11,
                imageUrl: 'second.jpg',
                heroPreviewUrl: 'second-p.jpg',
                orderIndex: 1,
              },
            ],
            taggedMembers: [],
            place: { placeId: 'p1', name: '카페 마루', address: '서울' },
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          }),
        ),
      );
    });

    await page.goto('/feed');
    await page.goto('/feed/1');

    await page.getByRole('button', { name: '2번째 사진' }).click({ timeout: 10_000 });
    await page.getByRole('button', { name: '더보기' }).click();
    await page.getByRole('button', { name: '삭제하기' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: '삭제하기' }).click();

    const frames = page.locator('[data-feed-detail-image-frame]');
    const visibilityOf = (index: number) =>
      frames.nth(index).evaluate((frame) => (frame as HTMLElement).style.visibility);
    await expect.poll(() => visibilityOf(1)).toBe('hidden');
    expect(await visibilityOf(0)).not.toBe('hidden');

    releaseDelete();
    await page.waitForURL(/\/feed$/, { timeout: 10_000 });
  });
});
