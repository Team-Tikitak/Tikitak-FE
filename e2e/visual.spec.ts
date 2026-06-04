import { type Page, expect, test } from '@playwright/test';
import {
  blockThirdParty,
  mockActivityHome,
  mockApi,
  mockFeedDetail,
  mockFeedList,
  seedHintSeen,
  skipSplash,
  stubImages,
} from './fixtures/api';

const MOCK_TEAM = {
  teamId: 100,
  teamMemberId: 200,
  teamName: 'VRT 팀',
  description: '시각 회귀 팀',
  role: 'OWNER' as const,
  nickname: '테스터',
  profileImgUrl: '',
  memberCount: 3,
  joinedAt: '2026-05-01T00:00:00.000Z',
  active: true,
  isActive: true,
};

/**
 * 시각 회귀(VRT).
 * baseline은 고정된 Playwright Docker 이미지(visual.yml)에서만 생성·비교한다.
 * 갱신: visual.yml의 workflow_dispatch(update=true) 또는 동일 이미지에서 `--update-snapshots`.
 *
 * 로딩·blur-up·트랜지션 같은 transient/애니메이션 상태는 픽셀 비교에 부적합하므로
 * 결정적 화면(원격 이미지·애니메이션 없음)만 앵커로 둔다.
 */
test.describe('@visual 시각 회귀', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'VRT baseline은 chromium 한 세트만 유지',
  );

  const settle = async (page: Page) => {
    // toHaveScreenshot가 연속 2프레임 동일까지 자동 대기하므로 별도 sleep 불필요.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  };

  test('로그인 페이지', async ({ page }) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('우리의 순간을 함께 남기는 공간')).toBeVisible();
    await settle(page);

    await expect(page).toHaveScreenshot('login.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('홈 — 팀 없음 EmptyTeamView', async ({ page }) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await mockApi(page, { me: { hasTeam: false, activeTeamId: null }, teams: [] });
    await page.goto('/home', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('아직 참여한 팀이 없어요')).toBeVisible({ timeout: 10_000 });
    await settle(page);

    await expect(page).toHaveScreenshot('home-empty.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('활동 페이지 — 월간 섹션', async ({ page }) => {
    // 앱이 h-dvh + 내부 스크롤이라 fullPage가 뷰포트까지만 잡힘 → 전 섹션 담기게 뷰포트를 키운다.
    await page.setViewportSize({ width: 393, height: 1400 });
    await skipSplash(page);
    await blockThirdParty(page);
    await stubImages(page);
    await mockApi(page, { me: { hasTeam: true, activeTeamId: 100 }, teams: [MOCK_TEAM] });
    await mockActivityHome(page, 100);
    await page.goto('/activity', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('추천 장소')).toBeVisible({ timeout: 10_000 });
    await settle(page);

    await expect(page).toHaveScreenshot('activity.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('피드 페이지 — 그리드', async ({ page }) => {
    await skipSplash(page);
    await blockThirdParty(page);
    await stubImages(page);
    await mockApi(page, { me: { hasTeam: true, activeTeamId: 100 }, teams: [MOCK_TEAM] });
    await mockFeedList(page, 100);
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('link', { name: /상세 보기/ }).first()).toBeVisible({
      timeout: 10_000,
    });
    await settle(page);

    await expect(page).toHaveScreenshot('feed-grid.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('피드 상세', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 1400 });
    await skipSplash(page);
    await blockThirdParty(page);
    await stubImages(page);
    await seedHintSeen(page); // 첫 방문 롱프레스 힌트 오버레이 제외
    await mockApi(page, { me: { hasTeam: true, activeTeamId: 100 }, teams: [MOCK_TEAM] });
    await mockFeedDetail(page, 100, 1);
    await page.goto('/feed/1', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('시각 회귀 상세 본문입니다. 좋은 하루였어요.')).toBeVisible({
      timeout: 10_000,
    });
    await settle(page);

    await expect(page).toHaveScreenshot('feed-detail.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });

  test('마이페이지', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 1400 });
    await skipSplash(page);
    await blockThirdParty(page);
    await stubImages(page);
    await mockApi(page, { me: { hasTeam: true, activeTeamId: 100 }, teams: [MOCK_TEAM] });
    await page.goto('/mypage', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('회원 탈퇴')).toBeVisible({ timeout: 10_000 });
    await settle(page);

    await expect(page).toHaveScreenshot('mypage.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    });
  });
});
