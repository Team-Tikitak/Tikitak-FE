export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// 로그인 코드 교환 mutation 식별 키 (LoginPage에서 useMutationState로 로딩 상태 조회)
export const LOGIN_CODE_EXCHANGE_MUTATION_KEY = ['auth', 'login-code-exchange'] as const;
