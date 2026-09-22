# JavaScript 성능 (JS)

## 1. Set/Map으로 O(1) 조회 (HIGH)

배열 검색 대신 Set/Map 사용.

```tsx
// ❌ O(n) 매번 탐색
const isSelected = selectedIds.includes(id);

// ✅ O(1) 조회
const selectedSet = new Set(selectedIds);
const isSelected = selectedSet.has(id);
```

## 2. 함수 결과 캐싱 (HIGH)

동일 입력에 대한 반복 계산 방지.

```tsx
// ❌ 매번 재계산
const getFormattedDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR').format(date);
};

// ✅ 캐싱
const formatCache = new Map<number, string>();
const getFormattedDate = (date: Date) => {
  const key = date.getTime();
  if (!formatCache.has(key)) {
    formatCache.set(key, new Intl.DateTimeFormat('ko-KR').format(date));
  }
  return formatCache.get(key)!;
};
```

## 3. 반복문 조기 종료 (MEDIUM)

조건 충족 시 즉시 종료.

```tsx
// ❌ 전체 순회
const found = items.filter((item) => item.id === targetId)[0];

// ✅ 조기 종료
const found = items.find((item) => item.id === targetId);
```

## 4. 반복문 병합 (MEDIUM)

같은 배열에 대한 여러 반복을 하나로 합치기.

```tsx
// ❌ 3번 순회
const names = users.map((u) => u.name);
const emails = users.map((u) => u.email);
const actives = users.filter((u) => u.active);

// ✅ 1번 순회
const names: string[] = [];
const emails: string[] = [];
const actives: User[] = [];
for (const u of users) {
  names.push(u.name);
  emails.push(u.email);
  if (u.active) actives.push(u);
}
```

## 5. 정규식 호이스팅 (LOW)

반복 호출되는 함수 안의 정규식은 밖으로 추출.

```tsx
// ❌ 매 호출마다 생성
const validate = (email: string) => /^[^\s@]+@[^\s@]+$/.test(email);

// ✅ 한번만 생성
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;
const validate = (email: string) => EMAIL_REGEX.test(email);
```
