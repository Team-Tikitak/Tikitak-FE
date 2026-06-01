import { json, mockApi, stubKakaoMap, wrap } from './fixtures/api';
import { expect, test } from './fixtures/auth';

const MOCK_TEAM = {
  teamId: 100,
  teamMemberId: 200,
  teamName: '지도팀',
  description: '테스트 팀',
  role: 'OWNER' as const,
  nickname: '테스터',
  profileImgUrl: '',
  memberCount: 1,
  joinedAt: '2026-05-01T00:00:00.000Z',
  active: true,
  isActive: true,
};

test.describe('홈 지도', () => {
  test.beforeEach(async ({ page }) => {
    await stubKakaoMap(page);
    await mockApi(page, {
      me: { hasTeam: true, activeTeamId: 100 },
      teams: [MOCK_TEAM],
    });
    await page.route('**/api/v1/teams/*/map/pins', async (route) =>
      route.fulfill(
        json(
          wrap({
            pins: [
              {
                placeId: 'p1',
                name: '카페 마루',
                latitude: 37.5,
                longitude: 127.0,
                address: '서울',
                thumbnailUrl: 'https://placehold.co/200',
                feedCount: 2,
              },
            ],
          }),
        ),
      ),
    );
    await page.route('**/api/v1/teams/*/daily-questions/**', async (route) =>
      route.fulfill(json(wrap({ questionId: null, content: '', answerDate: null }))),
    );
  });

  test('SDK 스텁으로 지도가 에러 없이 마운트된다', async ({ page }) => {
    await page.goto('/home');

    await expect(page.getByRole('button', { name: '지도팀' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('지도를 불러올 수 없습니다')).toHaveCount(0);
  });
});
