# 리렌더링 방지 (Rerender)

## 1. 파생 상태는 렌더 중 계산 (CRITICAL)

useEffect로 파생 상태를 설정하면 불필요한 리렌더가 발생.

```tsx
// ❌ useEffect로 파생 상태
const [filteredList, setFilteredList] = useState([]);
useEffect(() => {
  setFilteredList(list.filter((item) => item.active));
}, [list]);

// ✅ 렌더 중 계산
const filteredList = useMemo(() => list.filter((item) => item.active), [list]);
```

## 2. 함수형 setState (HIGH)

이전 상태에 의존하면 함수형으로 업데이트하여 stale closure 방지.

```tsx
// ❌ 의존성에 count 필요
setCount(count + 1);

// ✅ 이전 상태 참조
setCount((prev) => prev + 1);
```

## 3. lazy 초기화 (HIGH)

무거운 초기값은 함수로 전달하여 매 렌더마다 재계산 방지.

```tsx
// ❌ 매 렌더마다 실행
const [data] = useState(expensiveComputation());

// ✅ 초기 렌더에만 실행
const [data] = useState(() => expensiveComputation());
```

## 4. useRef로 일시적 값 관리 (HIGH)

리렌더가 필요 없는 값은 ref로 관리.

```tsx
// ❌ 불필요한 리렌더 유발
const [latestValue, setLatestValue] = useState(value);

// ✅ 리렌더 없이 최신값 유지
const latestRef = useRef(value);
latestRef.current = value;
```

## 5. useEffect 대신 이벤트 핸들러 (MEDIUM)

사이드이펙트가 특정 이벤트에 의한 것이면 이벤트 핸들러에서 처리.

```tsx
// ❌ useEffect로 처리
useEffect(() => {
  if (submitted) sendAnalytics();
}, [submitted]);

// ✅ 이벤트 핸들러에서 처리
const handleSubmit = () => {
  submit();
  sendAnalytics();
};
```

## 6. 무거운 컴포넌트 분리 후 memo (MEDIUM)

자주 바뀌는 상태와 무거운 렌더링을 분리.

```tsx
const ExpensiveList = memo(({ items }: { items: Item[] }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
));
```
