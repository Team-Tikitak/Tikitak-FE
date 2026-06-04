import type { Page } from '@playwright/test';

type SocialProvider = 'KAKAO' | 'GOOGLE' | 'APPLE';
type ProfileCharacterType =
  | 'TAK_LEADER'
  | 'TAK_SPARK'
  | 'TAK_BURNER'
  | 'TAK_BUILDER'
  | 'TAK_FREE'
  | 'TAK_CARE';

export interface MockMe {
  memberId: number;
  email: string;
  name: string;
  socialProvider: SocialProvider;
  status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN';
  hasAgreedRequiredTerms: boolean;
  onboardingCompleted: boolean;
  profileCharacterType: ProfileCharacterType | null;
  activeTeamId: number | null;
  hasTeam: boolean;
  createdAt: string;
}

export interface MockTeam {
  teamId: number;
  teamMemberId: number;
  teamName: string;
  description: string;
  role: 'OWNER' | 'MEMBER';
  nickname: string;
  profileImgUrl: string;
  memberCount: number;
  joinedAt: string;
  active: boolean;
  isActive: boolean;
}

export interface MockAgreements {
  termsAgreed: boolean;
  privacyAgreed: boolean;
  termsAgreedAt: string;
}

export const DEFAULT_ME: MockMe = {
  memberId: 1,
  email: 'test@tikitak.space',
  name: '테스트',
  socialProvider: 'GOOGLE',
  status: 'ACTIVE',
  hasAgreedRequiredTerms: true,
  onboardingCompleted: true,
  profileCharacterType: 'TAK_LEADER',
  activeTeamId: null,
  hasTeam: false,
  createdAt: '2026-05-01T00:00:00.000Z',
};

export const wrap = <T>(data: T) =>
  JSON.stringify({ success: true, data, timestamp: new Date().toISOString(), status: 200 });

export const json = (body: string) => ({ status: 200, contentType: 'application/json', body });

interface MockApiOptions {
  me?: Partial<MockMe>;
  teams?: MockTeam[];
  agreements?: Partial<MockAgreements>;
}

export const mockApi = async (page: Page, opts: MockApiOptions = {}): Promise<void> => {
  const me: MockMe = { ...DEFAULT_ME, ...opts.me };
  const teams: MockTeam[] = opts.teams ?? [];
  const agreements: MockAgreements = {
    termsAgreed: me.hasAgreedRequiredTerms,
    privacyAgreed: me.hasAgreedRequiredTerms,
    termsAgreedAt: '2026-05-01T00:00:00.000Z',
    ...opts.agreements,
  };

  await page.route('**/api/v1/auth/token/refresh', async (route) =>
    route.fulfill(json(wrap({ accessToken: 'mock-access-token' }))),
  );

  await page.route('**/api/v1/auth/logout', async (route) => route.fulfill(json(wrap(null))));

  await page.route('**/api/v1/me', async (route) => route.fulfill(json(wrap(me))));

  await page.route('**/api/v1/me/teams', async (route) => route.fulfill(json(wrap({ teams }))));

  await page.route('**/api/v1/me/agreements', async (route) =>
    route.fulfill(json(wrap(agreements))),
  );

  await page.route('**/api/v1/me/active-team', async (route) => route.fulfill(json(wrap(null))));

  await page.route('**/api/v1/me/onboarding', async (route) =>
    route.fulfill(json(wrap({ onboardingCompleted: true, profileCharacterType: 'TAK_LEADER' }))),
  );
};

export const skipSplash = async (page: Page): Promise<void> => {
  await page.context().addInitScript(() => {
    window.sessionStorage.setItem('splash-seen', '1');
  });
};

export const seedAccessToken = async (page: Page): Promise<void> => {
  // zustand 메모리 저장이라 미리 못 채움 — refresh mock으로 대신
  await page.context().addInitScript(() => {
    window.sessionStorage.setItem('tikitak:authed', '1');
  });
};

export const seedFeedListView = async (page: Page): Promise<void> => {
  await page.context().addInitScript(() => {
    window.sessionStorage.setItem('tikitak:feed-view-mode', 'list');
  });
};

// 첫 방문 롱프레스 힌트 오버레이를 본 것으로 시드 (클릭 가로채기 방지)
export const seedHintSeen = async (page: Page): Promise<void> => {
  await page.context().addInitScript(() => {
    window.localStorage.setItem('feed-detail-long-press-hint-seen', '1');
  });
};

// 외부 리소스(카카오·typekit) 차단 — load 지연 flaky 방지
export const blockThirdParty = async (page: Page): Promise<void> => {
  await page.route(/(dapi\.kakao\.com|use\.typekit\.net)/, (route) => route.abort());
};

// 모든 이미지 요청을 고정 SVG로 대체 — VRT 픽셀 결정성 확보(원격 이미지 의존 제거).
// 다른 route보다 먼저 등록할 것(가장 늦게 평가되어 API route에 우선권을 줌).
const SOLID_IMAGE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#9ca3af"/></svg>';

export const stubImages = async (page: Page): Promise<void> => {
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'image') {
      return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: SOLID_IMAGE_SVG });
    }
    return route.fallback();
  });
};

const FEED_LIST_ITEM = {
  feedId: 1,
  type: 'GENERAL' as const,
  content: '시각 회귀 피드',
  thumbnailImageUrl: 'https://mock.img/feed.jpg',
  heroPreviewUrl: 'https://mock.img/feed-preview.jpg',
  imageCount: 1,
  place: { placeId: 'p1', name: '카페 마루', address: '서울' },
  author: {
    teamMemberId: 200,
    nickname: '테스터',
    profileImageUrl: 'https://mock.img/profile.jpg',
    anonymous: false,
    isAnonymous: false,
  },
  commentCount: 2,
  reactionSummary: { totalCount: 3, items: [] },
  myReaction: null,
  createdAt: '2026-05-01T00:00:00.000Z',
};

// 활동 페이지 데이터 mock — daily(배너 숨김) + best-attendance + everyone-pick + regions + recommended-places
export const mockActivityHome = async (page: Page, teamId: number): Promise<void> => {
  const base = `**/api/v1/teams/${teamId}`;

  await page.route(`${base}/daily-questions/today`, async (route) =>
    route.fulfill(
      json(
        wrap({
          questionId: 1,
          content: '',
          date: '2026-05-01',
          answered: true,
          answerFeedId: 1,
          answer: null,
        }),
      ),
    ),
  );

  await page.route(`${base}/home/best-attendance`, async (route) =>
    route.fulfill(
      json(
        wrap({
          month: 5,
          members: [
            {
              rank: 1,
              teamMemberId: 200,
              nickname: '테스터',
              profileImgUrl: 'm.jpg',
              tagCount: 12,
            },
            { rank: 2, teamMemberId: 201, nickname: '동행', profileImgUrl: 'm.jpg', tagCount: 8 },
            { rank: 3, teamMemberId: 202, nickname: '친구', profileImgUrl: 'm.jpg', tagCount: 5 },
          ],
        }),
      ),
    ),
  );

  await page.route(`${base}/home/everyone-pick`, async (route) =>
    route.fulfill(json(wrap({ month: 5, picks: [FEED_LIST_ITEM] }))),
  );

  await page.route(`${base}/home/regions`, async (route) =>
    route.fulfill(
      json(
        wrap({
          month: 5,
          regions: [{ region: '서울', feedCount: 4, thumbnailImageUrl: 'r.jpg' }],
        }),
      ),
    ),
  );

  await page.route(`${base}/home/recommended-places`, async (route) =>
    route.fulfill(
      json(
        wrap({
          month: 5,
          places: [
            { name: '카페 마루', curation: '분위기 좋은 카페', imageUrl: 'c.jpg', kakaoMapUrl: '' },
            { name: '한강공원', curation: '산책하기 좋은 곳', imageUrl: 'h.jpg', kakaoMapUrl: '' },
          ],
        }),
      ),
    ),
  );
};

// 피드 목록 mock — 그리드 채울 6개 아이템
export const mockFeedList = async (page: Page, teamId: number): Promise<void> => {
  await page.route(new RegExp(`/api/v1/teams/${teamId}/feeds(\\?.*)?$`), async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    const items = Array.from({ length: 6 }, (_, i) => ({ ...FEED_LIST_ITEM, feedId: i + 1 }));
    await route.fulfill(
      json(
        wrap({ items, pageInfo: { hasNext: false, nextCursor: null, totalCount: items.length } }),
      ),
    );
  });
};

// 피드 상세 mock — 상세 본문 + 댓글(핀 1개)
export const mockFeedDetail = async (page: Page, teamId: number, feedId: number): Promise<void> => {
  // 댓글 — 핀 렌더용 1개 (detail보다 먼저 등록해 우선권 확보)
  await page.route(`**/api/v1/teams/${teamId}/feeds/${feedId}/comments`, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();
    await route.fulfill(
      json(
        wrap({
          items: [
            {
              commentId: 1,
              feedId,
              feedImageId: 10,
              content: '여기 분위기 좋다',
              positionX: 0.5,
              positionY: 0.5,
              author: {
                teamMemberId: 201,
                nickname: '동행',
                profileImageUrl: 'p.jpg',
                anonymous: false,
                isAnonymous: false,
              },
              createdAt: '2026-05-01T00:00:00.000Z',
              updatedAt: '2026-05-01T00:00:00.000Z',
              mine: false,
              isMine: false,
            },
          ],
          pageInfo: { nextCursor: null, hasNext: false, size: 1 },
        }),
      ),
    );
  });

  // 상세 — `$`로 끝을 막아 /comments 경로와 충돌 방지
  await page.route(
    new RegExp(`/api/v1/teams/${teamId}/feeds/${feedId}(\\?.*)?$`),
    async (route) => {
      if (route.request().method() !== 'GET') return route.fallback();
      await route.fulfill(
        json(
          wrap({
            feedId,
            type: 'GENERAL',
            content: '시각 회귀 상세 본문입니다. 좋은 하루였어요.',
            author: {
              teamMemberId: 200,
              nickname: '테스터',
              profileImageUrl: 'p.jpg',
              anonymous: false,
              isAnonymous: false,
            },
            images: [
              {
                feedImageId: 10,
                imageUrl: 'detail.jpg',
                heroPreviewUrl: 'preview.jpg',
                orderIndex: 0,
              },
            ],
            place: {
              placeId: 'p1',
              name: '카페 마루',
              latitude: 37.5,
              longitude: 127.0,
              address: '서울',
            },
            question: { questionId: 1, content: '', answerDate: '2026-05-01' },
            taggedMembers: [{ teamMemberId: 201, nickname: '동행', profileImageUrl: 'p.jpg' }],
            commentCount: 1,
            reactionSummary: { totalCount: 0, items: [] },
            myReaction: 'TAK_LEADER',
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
            mine: true,
            isMine: true,
          }),
        ),
      );
    },
  );
};

export const stubKakaoMap = async (page: Page): Promise<void> => {
  await page.context().addInitScript(() => {
    const latLng = (lat: number, lng: number) => ({ getLat: () => lat, getLng: () => lng });
    const makeMap = () => ({
      getProjection: () => ({ containerPointFromCoords: () => ({ x: 180, y: 360 }) }),
      getBounds: () => ({
        getSouthWest: () => latLng(37.0, 126.0),
        getNorthEast: () => latLng(38.0, 128.0),
      }),
      getCenter: () => latLng(37.5, 127.0),
      getLevel: () => 5,
      setLevel: () => {},
      setCenter: () => {},
      panTo: () => {},
    });
    const w = window as unknown as { kakao: unknown };
    w.kakao = {
      maps: {
        load: (cb: () => void) => cb(),
        Map: function () {
          return makeMap();
        },
        LatLng: function (lat: number, lng: number) {
          return latLng(lat, lng);
        },
        event: { addListener: () => {}, removeListener: () => {} },
      },
    };
  });
};

// 미디어 업로드 mock (uploads → presigned PUT → complete)
export const mockMediaUpload = async (page: Page): Promise<void> => {
  await page.route('**/api/v1/media/uploads', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    await route.fulfill(
      json(
        wrap({
          uploadId: 'upload-1',
          items: [
            {
              mediaPublicId: 'media-1',
              uploadUrl: 'https://r2.mock/upload/media-1',
              contentType: 'image/jpeg',
              expiresAt: '2026-12-31T00:00:00.000Z',
            },
          ],
        }),
      ),
    );
  });
  await page.route('https://r2.mock/**', async (route) => route.fulfill({ status: 200, body: '' }));
  await page.route('**/api/v1/media/uploads/*/complete', async (route) =>
    route.fulfill(json(wrap({ uploadId: 'upload-1', items: [{ mediaPublicId: 'media-1' }] }))),
  );
};

// getUserMedia를 canvas 스트림으로 대체
export const stubCamera = async (page: Page): Promise<void> => {
  await page.context().addInitScript(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#777777';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const withCapture = canvas as HTMLCanvasElement & {
      captureStream?: (fps?: number) => MediaStream;
    };
    const stream = withCapture.captureStream ? withCapture.captureStream(30) : new MediaStream();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: async () => stream,
        enumerateDevices: async () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
};
