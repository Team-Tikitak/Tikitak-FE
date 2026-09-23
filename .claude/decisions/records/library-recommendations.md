# 라이브러리/도구 도입 검토 메모

> 대화에서 정리된 추천/비추천 항목. 도입은 CLAUDE.md 룰대로 사전 합의 후 진행.

## 결론 요약

- 상태: accepted
- 기록일: 2026-09-23

| 항목                  | 결정           | 시점                  |
| --------------------- | -------------- | --------------------- |
| vaul                  | 도입 추천      | 바텀시트 만들 때      |
| overlay-kit           | 도입 추천      | vaul과 함께           |
| Radix UI Dialog       | 조건부 도입    | 일반 모달 필요할 때   |
| ssgoi                 | 도입 예정      | 페이지 5개+ 깔린 후   |
| @capacitor/app        | 필수           | Capacitor 패키징 시   |
| @capacitor/keyboard   | 필수           | Capacitor 패키징 시   |
| @capacitor/status-bar | 필수           | Capacitor 패키징 시   |
| @capacitor/haptics    | 선택           | 네이티브 느낌 강화 시 |
| Chromatic             | 제거/완화 검토 | 지금                  |

---

## 1. 바텀시트 — vaul + overlay-kit

- 상태: accepted
- 기록일: 2026-09-23

### 선택 이유

- **vaul**: iOS 네이티브 바텀시트 UX 그대로 (드래그 닫기, snap point, velocity dismiss). 번들 ~5kb. Radix 위에 빌드되어 접근성 자동.
- **overlay-kit**: Toss 라이브러리. 명령형 호출(`overlay.openAsync`)로 모달을 함수처럼 띄우고 결과를 await로 받음. useState 보일러플레이트 제거.
- 두 라이브러리는 **다른 레이어**. vaul = UI/모션, overlay-kit = 호출 관리. 함께 쓰는 게 한국 React 팀 표준 조합.

### 사용 예시

```tsx
const team = await overlay.openAsync(({ isOpen, close }) => (
  <Drawer.Root open={isOpen} onOpenChange={() => close(null)}>
    <Drawer.Content className="pb-[env(safe-area-inset-bottom)] ...">
      {teams.map((t) => (
        <button onClick={() => close(t)}>{t.name}</button>
      ))}
    </Drawer.Content>
  </Drawer.Root>
));
```

### Capacitor 호환성

- 기본 동작은 그대로 됨 (WebView는 모바일 브라우저 동등)
- 추가로 챙길 것:
  - **Android 백버튼 → 시트 닫기** (`@capacitor/app` backButton 리스너)
  - **safe-area-inset-bottom** 패딩 (vaul이 자동으로 안 넣어줌)
  - **키보드 동작** 실기기 확인 (`@capacitor/keyboard` 모드 설정)
  - **iOS 오버스크롤** 충돌 — 필요 시 `capacitor.config`에서 `scrollEnabled: false`

### 직접 구현 시 체크리스트 (참고)

- 슬라이드 업/다운 트랜지션
- 백드롭 fade + 클릭 닫기
- 드래그 제스처 + velocity dismiss
- ESC, focus trap, 스크롤 락
- safe-area, 키보드 회피
  → 5~6시간 + 엣지케이스 계속 발생. 라이브러리 권장.

---

## 2. 페이지 전환 — ssgoi (앱 기준)

- 상태: accepted
- 기록일: 2026-09-23

### 선택 이유

- 네이티브 앱 사용자는 화면 전환이 **즉시 펑 바뀌면** 웹 같다고 느낌. ssgoi가 이 문제 해결.
- View Transitions API 기반, React Router 7 어댑터 있음, ~3kb.
- iOS 17+ 완전 지원, Capacitor iOS 16+ 타겟이면 무난.

### 적용 대상 예시

- 모임 카드 → 상세: 오른쪽 슬라이드인
- 뒤로가기: 대칭 슬라이드아웃
- 탭 간 이동: fade
- 모달: from bottom

### 도입 타이밍 — 지금 아님

1. 라우트가 거의 없음 → 적용할 화면이 없음
2. 페이지 전환 디자인 명세 미정
3. **선 화면 후 일괄 적용**이 효율적

### 권장 로드맵

| 시점             | 작업                                                  |
| ---------------- | ----------------------------------------------------- |
| 지금             | UI 빌딩 블록(BottomSheet 등) + 핵심 페이지 3~5개 구현 |
| 페이지 5개+      | ssgoi 도입, 라우트 단위 슬라이드 전환 일괄 적용       |
| Capacitor 패키징 | 백버튼·키보드·safe-area·햅틱 같이 처리                |
| 베타             | 실기기에서 트랜지션 폴리싱                            |

---

## 3. Capacitor 부속 플러그인

- 상태: accepted
- 기록일: 2026-09-23

### 필수 (앱 패키징 시)

- **@capacitor/app**: Android 하드웨어 백버튼 리스너. 시트/모달 닫기 연결 필수.
  ```tsx
  App.addListener('backButton', () => setOpen(false));
  ```
- **@capacitor/keyboard**: 키보드 올라올 때 시트/입력창 동작 제어. iOS `KeyboardResize` 모드 설정 필요.
- **@capacitor/status-bar**: 화면별 status bar 글자색/배경색 제어. (status bar 자체는 OS가 그림 — mock 만들지 말 것)

### 선택

- **@capacitor/haptics**: 버튼 탭, 시트 열림 등에 진동 피드백. 네이티브 느낌 큰 폭 향상.

---

## 4. 만들지 말 것 (디자이너 시안에 있어도)

- 상태: accepted
- 기록일: 2026-09-23

### iOS Status Bar (시계/배터리 영역)

- OS가 그림. mock 만들면 실기기에서 이중 표시.
- `pt-[env(safe-area-inset-top)]`로 안전영역만 확보.

### iOS Home Indicator (하단 검은 막대)

- OS가 그림. 동일 이유.
- `pb-[env(safe-area-inset-bottom)]` 이미 [src/app/layout/AppLayout.tsx#L31](src/app/layout/AppLayout.tsx#L31)에 적용됨.

### 디자이너 합의 사항

- "Status bar / Home Indicator는 구현 대상에서 제외, 화면별 status bar 스타일 변경만 별도로 알려달라"고 한번 합의해두면 이후 헤매지 않음.

---

## 5. Chromatic — 도입 재검토

- 상태: proposed
- 기록일: 2026-09-23

### 현 상태

- PR마다 22개 baseline 승인 요구 → 결국 다 Accept 누르게 됨 → 의미 상실
- 무료 티어 5000 snapshot/월 빠르게 소진

### 옵션

1. **제거** — 가장 단순. 현 단계 추천.
2. **남기되 required check 해제** — 참고용으로만, 머지 차단 X.
3. **핵심 컴포넌트만 (Button/Input 등)** — 22개 → 5개로 축소.

### E2E와의 관계

- 상호보완이지 대체 X. E2E는 동작, Chromatic은 외형.
- 제품 팀이라면 **Playwright + 핵심 시나리오 5~10개**가 ROI 훨씬 높음 (로그인, 모임 생성, 댓글 등).

---

## 검토 체크리스트 (도입 결정 시)

- 상태: proposed
- 기록일: 2026-09-23

- [ ] vaul 추가 (바텀시트 첫 구현 시)
- [ ] overlay-kit 추가 (vaul과 함께)
- [ ] Radix Dialog 추가 (일반 모달 필요해질 때)
- [ ] ssgoi 도입 (페이지 5개+ 시점)
- [ ] Capacitor 플러그인 (app/keyboard/status-bar/haptics) — 패키징 단계
- [ ] Chromatic 처리 방향 결정 (제거 vs 완화)
- [ ] 디자이너와 status bar / home indicator 구현 제외 합의
- [ ] iOS 타겟 버전 확정 (View Transitions API 지원 확인용)
