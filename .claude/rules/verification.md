# Verification Rules

## 기본 원칙

- 코드 변경 후 가능한 가장 작은 검증을 먼저 실행한다.
- 실행하지 않은 검증을 했다고 기록하지 않는다.
- 검증을 실행하지 못했으면 이유와 남은 리스크를 남긴다.
- 실패가 있으면 원인, 영향 범위, 다음 조치를 확인한 뒤 보고한다.

## 검증 선택 기준

- 타입 영향: `yarn type-check`
- 포맷 영향: `yarn format:check`
- lint 영향: `yarn lint`
- 로직 영향: `yarn test --run`
- 빌드 영향: `yarn build`
- barrel export 영향: `yarn gen:index:check`
- 디자인 토큰 영향: `yarn tokens:check`
- 라우팅/사용자 플로우 영향: `yarn e2e --project=mobile-chrome`
- 공용 UI 영향: Storybook story 추가/갱신 또는 `yarn build-storybook`

## 권장 조합

### 작은 로직 변경

```bash
yarn type-check
yarn test --run
```

### UI 또는 shared 변경

```bash
yarn lint
yarn type-check
yarn test --run
```

필요하면 Storybook 또는 관련 E2E를 추가로 확인한다.

### 라우팅 / 사용자 플로우 변경

```bash
yarn build
yarn e2e --project=mobile-chrome
```

### 설정 / CI 변경

```bash
yarn format:check
yarn lint
```

변경 대상 workflow나 script가 있으면 해당 명령을 별도로 확인한다.

## 최종 보고

최종 보고에는 다음을 포함한다.

- 변경 요약
- 실행한 검증
- 실행하지 못한 검증과 이유
- 남은 리스크 또는 후속 작업
