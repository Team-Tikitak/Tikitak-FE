# Domain: Team

팀 생성·프로필 설정·상세 조회. 가장 활발히 작업 중인 도메인.

## 라우트

| 경로                 | 페이지                        |
| -------------------- | ----------------------------- |
| `/teams/new`         | `src/pages/teamCreate/`       |
| `/teams/new/profile` | `src/pages/teamProfileSetup/` |
| `/teams/:teamId`     | `src/pages/teamDetail/`       |

`paths.ts`: `PATHS.TEAM_CREATE`, `PATHS.TEAM_PROFILE_SETUP`, `PATHS.TEAM_DETAIL`.
`toTeamDetail(teamId)` 헬퍼로 동적 경로 생성.

## 공통 타입 (single source of truth)

```ts
// src/shared/types/team.ts
export const TEAM_ROLES = ['OWNER', 'MEMBER'] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];
```

문자열 union(`'OWNER' | 'MEMBER'`)을 새로 박지 말고 위 튜플 기반 타입 import.

## 페이지별 모델

```ts
// teamCreate/model/types.ts — 생성 폼 초안
export interface TeamDraft {
  name: string;
  description: string;
}

// teamProfileSetup/model/types.ts — 라우터 state 전달 형태
export interface TeamDraftRouteState {
  name: string;
  description: string;
}

// teamDetail/model/types.ts
export interface TeamDetail {
  teamId: number;
  name: string;
  description: string;
  teamImageUrl: string;
  status: TeamStatus;
  memberCount: number;
  myTeamMemberId: number;
  myRole: TeamRole;
  myNickname: string;
  myProfileImageUrl: string;
  createdAt: string;
}
export interface TeamMember {
  teamMemberId: number;
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
  role: TeamRole;
  email: string | null;
  status: TeamStatus;
  joinedAt: string;
}
```

## 흐름

1. `/teams/new` — 이름·설명 입력 (`useTeamCreateForm`) → `TeamDraft`
2. router state로 `TeamDraftRouteState` 전달 → `/teams/new/profile`
3. 프로필(이미지·닉네임) 추가 → 생성 API → `/teams/:teamId`
4. `/teams/:teamId` — `useTeamDetail` 훅이 팀·멤버·`isOwner` 반환

## 훅

- `useTeamCreateForm` — 생성 폼 상태·`isDisabled`·`draft` 반환
- `useTeamProfileSetup` — 프로필 설정 폼 (form + model 분리)
- `useTeamDetail` — `useParams`로 `teamId`, 팀·멤버·`isOwner` 반환

## 현재 상태

- `shared/api/team/`(`api.ts`/`types.ts`/`queries.ts`) 구현됨. 상세는 `useGetTeamDetail`로 실 API 연결.
- 주요 mutation: `useTeamDelete`, `useLeaveTeam`, `useDeleteTeamMember`, `usePatchActiveTeam`(user).

## 팀 삭제·회원탈퇴 제약 (2026-06)

확인-only 다이얼로그 = `@/shared/lib/native/nativeDialog`의 `alertDialog`(네이티브 `Dialog.alert`, 웹 `window.alert` 폴백).

- **그룹 삭제**: 활성 팀원 2명 이상이면 삭제 불가(백엔드 `400 TEAM010`, BE PR #117). FE는 `useTeamDetailActions.confirmDelete`에서 `memberCount > 1`이면 `alertDialog`로 안내하고 API 호출 안 함(`TeamDetailPage`가 `members.length` 전달). 정상 흐름은 사전 차단, stale 대비 백엔드가 2차 방어.
- **회원 탈퇴**: `role === 'OWNER'`인 팀이 하나라도 있으면 탈퇴 불가. `MyPage.handleWithdraw`에서 `teams.some((t) => t.role === 'OWNER')`면 `alertDialog` 안내 후 중단(**FE 가드** — BE PR #117엔 탈퇴 제약 없음). 먼저 그룹 삭제/위임 필요.

## 작업 시 주의

- 역할 분기는 항상 `TeamRole` import 사용 (`myRole === 'OWNER'` 직접 비교 OK).
- 생성 → 프로필 단계 사이 데이터 전달은 router state (`useLocation`) + `TeamDraftRouteState` 타입.
- 새 페이지·기능 추가 시 `PATHS`에 상수 등록 + `toTeamDetail` 패턴 따라 헬퍼 작성.
- 폼 로직은 hook으로 분리 (`useTeamCreateForm` 사례 참고). UI 컴포넌트에 상태 직접 박지 않음.
