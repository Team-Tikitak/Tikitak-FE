# 렌더링 최적화 (Rendering)

## 1. 조건부 렌더링 (HIGH)

보이지 않는 컴포넌트는 렌더링하지 않기.

```tsx
// ❌ CSS로 숨김 (DOM에는 존재)
<div style={{ display: isVisible ? 'block' : 'none' }}>
  <HeavyComponent />
</div>;

// ✅ 조건부 렌더링 (DOM에서 제거)
{
  isVisible && <HeavyComponent />;
}
```

## 2. useTransition으로 비긴급 업데이트 (HIGH)

검색 입력처럼 즉각 반응이 필요한 UI와 결과 렌더링을 분리.

```tsx
const [query, setQuery] = useState('');
const [isPending, startTransition] = useTransition();

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);
  startTransition(() => {
    setSearchResults(filterResults(e.target.value));
  });
};
```

## 3. JSX 호이스팅 (MEDIUM)

변하지 않는 JSX는 컴포넌트 밖으로 추출하여 재생성 방지.

```tsx
// ❌ 매 렌더마다 재생성
const Component = () => {
  const header = (
    <header>
      <h1>타이틀</h1>
    </header>
  );
  return <div>{header}</div>;
};

// ✅ 컴포넌트 밖에서 한번만 생성
const header = (
  <header>
    <h1>타이틀</h1>
  </header>
);
const Component = () => <div>{header}</div>;
```

## 4. content-visibility 활용 (MEDIUM)

긴 리스트에서 화면 밖 요소의 렌더링을 지연.

```tsx
<div className="content-visibility-auto contain-intrinsic-size-[0_500px]">
  {items.map((item) => (
    <ListItem key={item.id} item={item} />
  ))}
</div>
```
