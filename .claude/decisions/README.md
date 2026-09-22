# Decisions

구조, 라이브러리, 공통 규칙처럼 이후 작업에도 계속 영향을 주는 결정을 기록하는 폴더입니다.
새 결정 문서를 만들기 전에 이 문서를 먼저 확인합니다.

## 기록 기준

아래에 해당하면 기록합니다.

- 여러 방식이 가능했고, 그중 하나를 선택한 이유가 있다(대안이 없었으면 기록할 필요 없음).
- 나중에 "왜 이렇게 했지?"라는 질문이 다시 나올 가능성이 있다.
- 특정 라이브러리·아키텍처·데이터 흐름을 프로젝트 전반에 적용하기로 정했다.
- 플랫폼(웹/네이티브·Capacitor) 제약 때문에 일반적인 방식 대신 다른 방식을 택했다.

아래는 기록하지 않습니다.

- 기존 규칙을 그대로 따르는 단순 구현.
- 오타 수정, 일회성 UI 조정처럼 재현되지 않는 변경.
- `.claude/refactoring/`에 이미 있는 리팩터링 평가(구조는 안 바뀌고 배치/코드 정리만 한 경우는
  refactoring 쪽에 남긴다 — 판단 기준은 "다음에도 같은 선택을 반복해야 하는가"이다).

## 새 결정 문서 작성

`template.md`를 복사해서 `records/<주제>.md`로 만듭니다. 한 파일에 여러 개의 관련 결정을
담아도 됩니다(예: `records/auth-flow.md`처럼 인증 흐름 관련 결정을 한 파일에 이어서 씁니다)
— 완전히 다른 주제면 새 파일로 분리합니다. `README.md`/`template.md`만 `decisions/` 바로
아래 두고, 실제 결정 문서는 전부 `records/` 하위에 모읍니다(GraVerty-FE와 동일한 레이아웃,
단 파일명은 `NNN-` 번호 없이 주제별 그대로).

각 `##` 결정 섹션 바로 아래에 `상태`와 `기록일`을 남깁니다.

- 상태: `proposed`(제안됨, 아직 미확정) / `accepted`(채택되어 현재 유효) /
  `superseded`(다른 섹션으로 대체됨) / `rejected`(검토 후 미채택)
- `superseded`일 때는 `- 대체: <대체하는 섹션 제목>`으로 어느 섹션이 이어받는지 링크합니다.

기존 결정이 나중에 바뀌면, 파일을 지우지 말고 옛 섹션의 상태를 `superseded`로 바꾼 뒤
같은 파일에 날짜를 붙인 새 `##` 섹션을 추가해서 "무엇이 왜 바뀌었는지"가 남게 합니다.

## 인덱스

전부 `records/` 하위 파일입니다.

| 파일                                     | 주제                                             |
| ---------------------------------------- | ------------------------------------------------ |
| `records/api-structure.md`               | API 클라이언트/요청 구조                         |
| `records/auth-flow.md`                   | 인증 흐름 (access/refresh token, silent refresh) |
| `records/bottom-sheet.md`                | 바텀시트 구현 방식                               |
| `records/capacitor-bundling-strategy.md` | Capacitor 번들링 전략                            |
| `records/capacitor-setup.md`             | Capacitor 초기 설정                              |
| `records/dependency-maintenance.md`      | 의존성 유지보수 정책                             |
| `records/error-boundary.md`              | 에러 바운더리 구조                               |
| `records/error-handling.md`              | 에러 처리 전략                                   |
| `records/feed-view-mode.md`              | 피드 보기 모드                                   |
| `records/library-recommendations.md`     | 라이브러리 선정 근거                             |
| `records/map-clustering.md`              | 지도 클러스터링                                  |
| `records/native-deep-links.md`           | 네이티브 딥링크                                  |
| `records/native-media.md`                | 네이티브 미디어(카메라/갤러리)                   |
| `records/native-oauth.md`                | 네이티브 OAuth                                   |
| `records/performance.md`                 | 성능 최적화 결정                                 |
| `records/photo-aspect-ratio.md`          | 사진 비율 처리                                   |
| `records/route-loaders.md`               | 라우트 loader 전략                               |
| `records/swipe-back-navigation.md`       | 스와이프 백 네비게이션                           |
| `records/transitions.md`                 | 화면 전환 애니메이션                             |
| `records/visual-regression.md`           | 시각 회귀 테스트                                 |
