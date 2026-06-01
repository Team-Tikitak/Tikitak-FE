import { json, mockApi, mockMediaUpload, stubCamera, wrap } from './fixtures/api';
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

test.describe('데일리 피드 작성', () => {
  test.beforeEach(async ({ page }) => {
    await stubCamera(page);
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [MOCK_TEAM],
    });
    await mockMediaUpload(page);
    await page.route('**/api/v1/teams/100/daily-questions/today', async (route) =>
      route.fulfill(
        json(
          wrap({
            questionId: 42,
            content: '오늘 가장 기억에 남는 순간은?',
            date: '2026-05-01',
            answered: false,
            answerFeedId: null,
            answer: null,
          }),
        ),
      ),
    );
    await page.route('**/api/v1/teams/100/daily-questions/42/my-answer', async (route) =>
      route.fulfill(
        json(
          wrap({
            feedId: 1,
            type: 'DAILY_QUESTION',
            question: {
              questionId: 42,
              content: '오늘 가장 기억에 남는 순간은?',
              answerDate: '2026-05-01',
            },
            answer: { content: '답변', imageUrl: '', createdAt: '', updatedAt: '' },
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          }),
        ),
      ),
    );
    await page.route(/\/api\/v1\/teams\/100\/feeds(\?.*)?$/, async (route) =>
      route.fulfill(json(wrap({ items: [], pageInfo: { hasNext: false, nextCursor: null } }))),
    );
  });

  // 헤드리스에서 canvas 스트림 video가 isReady에 도달 못 함(엔진 의존) → 안정화 전까지 skip
  test.fixme('카메라로 사진을 찍고 공유하면 목록으로 돌아간다', async ({ page }) => {
    await page.goto('/feed');
    await page.goto('/feed/new/daily');

    await expect(page.getByText('오늘 가장 기억에 남는 순간은?')).toBeVisible({ timeout: 10_000 });

    // 사진 슬롯 → 카메라 오버레이
    await page.getByRole('button', { name: '0/1' }).click();
    await page.getByRole('button', { name: '카메라 버튼' }).click({ timeout: 10_000 });
    await page.getByText('업로드').click({ timeout: 10_000 });

    const shareButton = page.getByRole('button', { name: '공유하기' });
    await expect(shareButton).toBeEnabled({ timeout: 10_000 });
    await shareButton.click();

    await page.waitForURL(/\/feed$/, { timeout: 10_000 });
  });
});
