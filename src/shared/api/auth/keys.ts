export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export const LOGIN_CODE_EXCHANGE_MUTATION_KEY = ['auth', 'login-code-exchange'] as const;
