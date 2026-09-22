# 데이터 페칭 가이드

## 전략

| 상황                 | 방식          |
| -------------------- | ------------- |
| 서버 데이터 조회     | `useQuery`    |
| 서버 데이터 변경     | `useMutation` |
| 클라이언트 전역 상태 | zustand       |
| UI 로컬 상태         | `useState`    |

## API 호출 구조

```
shared/api/
├── instance.ts          ← axios 인스턴스 + 인터셉터
├── auth/
│   ├── api.ts           ← API 호출 함수
│   ├── types.ts         ← 요청/응답 타입
│   └── queries.ts       ← useQuery/useMutation 훅
├── user/
│   ├── api.ts
│   ├── types.ts
│   └── queries.ts
└── index.ts             ← barrel export
```

### axios 인스턴스

```tsx
// shared/api/instance.ts
import axios from 'axios';

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
```

### API 함수

```tsx
// shared/api/auth/api.ts
import { instance } from '../instance';
import { type LoginRequest, type LoginResponse } from './types';

export const authApi = {
  login: (body: LoginRequest) => instance.post<LoginResponse>('/auth/login', body),
  logout: () => instance.post('/auth/logout'),
};
```

## Query Key 설계

계층적으로 설계하여 캐시 무효화를 유연하게:

```tsx
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

export const postKeys = {
  all: ['posts'] as const,
  list: (filters?: PostFilters) => [...postKeys.all, 'list', filters] as const,
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
};
```

## Query 훅

```tsx
// 조회
export const useUser = () =>
  useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getUser().then((res) => res.data),
  });

// 변경
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};
```

## 규칙

- API 호출은 `shared/api`의 함수를 통해 사용
- 데이터 페칭은 `useEffect` 대신 TanStack Query 사용
- 에러/로딩 상태 핸들링 권장
- queryKey는 도메인별 keys 객체에서 관리
- `any` 대신 명시적 타입 정의 사용
