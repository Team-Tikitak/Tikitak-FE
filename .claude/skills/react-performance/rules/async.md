# 비동기 패턴 (Async)

## 1. 병렬 요청 (CRITICAL)

독립적인 API 호출은 `Promise.all`로 병렬 처리. 순차 실행 대비 2~10배 개선.

```tsx
// ❌ 순차 실행
const user = await getUser();
const posts = await getPosts();

// ✅ 병렬 실행
const [user, posts] = await Promise.all([getUser(), getPosts()]);
```

## 2. 불필요한 await 제거 (HIGH)

후속 작업이 필요 없으면 await 없이 실행하여 블로킹 방지.

```tsx
// ❌ 불필요한 대기
await logAnalytics(event);
navigate('/next');

// ✅ 대기 없이 실행
logAnalytics(event);
navigate('/next');
```

## 3. Suspense 경계 활용 (MEDIUM)

데이터 로딩 시 Suspense로 로딩 상태를 선언적으로 관리.

```tsx
<Suspense fallback={<Skeleton />}>
  <UserProfile />
</Suspense>
```
