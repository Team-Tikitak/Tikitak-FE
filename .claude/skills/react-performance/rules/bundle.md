# 번들 최적화 (Bundle)

## 1. barrel import 피하기 (CRITICAL)

barrel 파일(`index.ts`)에서 import하면 사용하지 않는 모듈도 번들에 포함될 수 있음.

```tsx
// ❌ barrel import
import { Button } from '@/shared/ui';

// ✅ 직접 import
import { Button } from '@/shared/ui/Button';
```

## 2. 동적 import (CRITICAL)

초기 로딩에 필요 없는 무거운 컴포넌트는 `React.lazy`로 분리.

```tsx
// ❌ 정적 import
import { HeavyChart } from '@/shared/ui/HeavyChart';

// ✅ 동적 import
const HeavyChart = lazy(() => import('@/shared/ui/HeavyChart'));

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>;
```

## 3. 서드파티 라이브러리 지연 로딩 (HIGH)

초기 렌더에 필요 없는 라이브러리는 동적으로 로드.

```tsx
// ❌ 항상 로드
import dayjs from 'dayjs';

// ✅ 필요할 때 로드
const formatDate = async (date: Date) => {
  const dayjs = (await import('dayjs')).default;
  return dayjs(date).format('YYYY-MM-DD');
};
```

## 4. 조건부 번들 로딩 (MEDIUM)

특정 조건에서만 필요한 모듈은 조건부로 로드.

```tsx
const loadEditor = () => import('@/shared/ui/RichEditor');

const PostForm = () => {
  const [Editor, setEditor] = useState<ComponentType | null>(null);

  const handleEdit = async () => {
    const { default: RichEditor } = await loadEditor();
    setEditor(() => RichEditor);
  };
};
```
