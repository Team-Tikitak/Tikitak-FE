---
name: scaffold-api
description: OpenAPI/Swagger 스펙을 읽어 TypeScript 타입, API 클라이언트 함수, TanStack Query 훅을 자동 생성합니다.
user-invocable: true
argument-hint: <swagger-url> [filter]
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, WebFetch
---

# 워크플로우

## 1단계: 스펙 로드

제공된 URL에서 가져오기. 실패 시 `/swagger.json`, `/api-docs`, `/openapi.json` 시도.

## 2단계: 엔드포인트 선택

모든 엔드포인트를 테이블로 표시. 필터 키워드가 있으면 해당 항목만 표시. 사용자에게 생성할 항목 선택 요청.

## 3단계: 데이터 페칭 전략 결정

| 조건                        | 전략          |
| --------------------------- | ------------- |
| GET                         | `useQuery`    |
| POST / PUT / PATCH / DELETE | `useMutation` |

## 4단계: 도메인 이름 추출

URL 경로에서 추출 (예: `/api/posts/...` → `post`).

## 5단계: 파일 생성

### `shared/api/{domain}/types.ts`

OpenAPI 스키마를 TypeScript 인터페이스로 변환. `integer` → `number`, `enum` → 유니온 타입. nullable 유지.

### `shared/api/{domain}/api.ts`

```typescript
import { instance } from '../instance';

export const postApi = {
  getList: () => instance.get<Post[]>('/posts'),
  getById: (id: number) => instance.get<Post>(`/posts/${id}`),
  create: (body: CreatePostRequest) => instance.post<Post>('/posts', body),
};
```

### `shared/api/{domain}/queries.ts`

```typescript
const postKeys = {
  all: ['posts'] as const,
  list: () => [...postKeys.all, 'list'] as const,
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
};

export const usePosts = () => useQuery({ queryKey: postKeys.list(), queryFn: postApi.getList });
```

## 6단계: 결과 보고

생성된 파일 목록과 다음 단계 안내.

# 규칙

- 프로젝트 구조: `shared/api/{domain}/` 하위에 생성
- `any` 금지 — 스펙에서 모든 타입 추출
- 네이밍: `getList`, `getById`, `create`, `update`, `remove`
- axios 인스턴스는 `shared/api/instance.ts`에서 import
