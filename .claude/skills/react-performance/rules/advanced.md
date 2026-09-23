# 고급 패턴 (Advanced)

## 1. 안정적인 이벤트 핸들러 ref (MEDIUM)

콜백 함수가 의존성 배열에 포함되면 불필요한 재실행이 발생. ref로 안정화.

```tsx
// ❌ onChange가 바뀔 때마다 effect 재실행
useEffect(() => {
  socket.on('message', onChange);
  return () => socket.off('message', onChange);
}, [onChange]);

// ✅ ref로 안정적 참조
const onChangeRef = useRef(onChange);
onChangeRef.current = onChange;

useEffect(() => {
  const handler = (...args: unknown[]) => onChangeRef.current(...args);
  socket.on('message', handler);
  return () => socket.off('message', handler);
}, []);
```

## 2. 초기화 중복 방지 (MEDIUM)

Strict Mode에서 useEffect가 두 번 실행될 때 중복 초기화 방지.

```tsx
// ❌ 두 번 초기화될 수 있음
useEffect(() => {
  initSDK();
}, []);

// ✅ ref로 중복 방지
const initialized = useRef(false);
useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;
  initSDK();
}, []);
```

## 3. useLatest 패턴 (LOW)

최신 값을 참조하되 의존성 배열에 포함시키지 않는 패턴.

```tsx
const useLatest = <T,>(value: T) => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

// 사용
const latestCallback = useLatest(callback);

useEffect(() => {
  const interval = setInterval(() => {
    latestCallback.current();
  }, 1000);
  return () => clearInterval(interval);
}, []);
```
