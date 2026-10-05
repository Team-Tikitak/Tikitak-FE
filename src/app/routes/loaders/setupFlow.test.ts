import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userKeys } from '@/shared/api/user/keys';

const STALE_AFTER_MS = 10 * 60 * 1000;

const { getMeMock, getAgreementsMock, testQueryClient } = vi.hoisted(() => ({
  getMeMock: vi.fn(),
  getAgreementsMock: vi.fn(),
  testQueryClient: { current: null as unknown as QueryClient },
}));

vi.mock('@/app/providers/queryClient', () => ({
  get queryClient() {
    return testQueryClient.current;
  },
}));
vi.mock('@/shared/api/user/api', () => ({
  getMe: getMeMock,
  getAgreements: getAgreementsMock,
  getTeams: vi.fn(),
}));

const { setupFlowLoader } = await import('./setupFlow');
const { useAuthStore } = await import('@/shared/stores/authStore');

const envelope = <T>(data: T) => ({ data: { success: true, data } });

const completeMe = { memberId: 1, onboardingCompleted: true, hasAgreedRequiredTerms: true };
const completeAgreements = { termsAgreed: true, privacyAgreed: true };

// 복원된 영속 캐시처럼 오래된(stale) 데이터를 심는다
const seedRestoredCache = (me: object, agreements: object) => {
  const updatedAt = Date.now() - STALE_AFTER_MS;
  testQueryClient.current.setQueryData(userKeys.me(), me, { updatedAt });
  testQueryClient.current.setQueryData(userKeys.agreements(), agreements, { updatedAt });
};

const runLoader = (path: string) =>
  setupFlowLoader({ request: new Request(`http://localhost${path}`) } as Parameters<
    typeof setupFlowLoader
  >[0]);

describe('setupFlowLoader의 복원 캐시 사용', () => {
  beforeEach(() => {
    useAuthStore.getState().setAccessToken('token');
    testQueryClient.current = new QueryClient({
      defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
    });
    getMeMock.mockReset();
    getAgreementsMock.mockReset();
  });

  it('완료 상태의 복원 캐시는 서버 응답을 기다리지 않고 바로 통과한다', async () => {
    seedRestoredCache(completeMe, completeAgreements);
    // 서버 응답이 끝나지 않아도 loader가 막히지 않아야 한다
    getMeMock.mockReturnValue(new Promise(() => undefined));
    getAgreementsMock.mockReturnValue(new Promise(() => undefined));

    await expect(runLoader('/home')).resolves.toBeNull();
  });

  it('온보딩 미완료로 복원된 캐시는 최신 값을 받아 다시 판단한다', async () => {
    seedRestoredCache({ ...completeMe, onboardingCompleted: false }, completeAgreements);
    // 다른 기기에서 이미 온보딩을 마친 경우
    getMeMock.mockResolvedValue(envelope(completeMe));
    getAgreementsMock.mockResolvedValue(envelope(completeAgreements));

    await expect(runLoader('/home')).resolves.toBeNull();
    expect(getMeMock).toHaveBeenCalled();
  });

  it('약관 미동의로 복원된 캐시도 최신 값을 받아 다시 판단한다', async () => {
    seedRestoredCache(completeMe, { termsAgreed: false, privacyAgreed: false });
    // 다른 기기에서 이미 약관에 동의한 경우
    getMeMock.mockResolvedValue(envelope(completeMe));
    getAgreementsMock.mockResolvedValue(envelope(completeAgreements));

    await expect(runLoader('/home')).resolves.toBeNull();
    expect(getAgreementsMock).toHaveBeenCalled();
  });

  it('최신 값도 미완료면 온보딩으로 보낸다', async () => {
    seedRestoredCache({ ...completeMe, onboardingCompleted: false }, completeAgreements);
    getMeMock.mockResolvedValue(envelope({ ...completeMe, onboardingCompleted: false }));
    getAgreementsMock.mockResolvedValue(envelope(completeAgreements));

    const result = (await runLoader('/home')) as Response;

    expect(result.headers.get('Location')).toBe('/onboarding');
  });
});
