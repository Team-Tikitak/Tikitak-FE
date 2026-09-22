# Domain: Invitation

팀 초대 링크 생성, 초대 수락, 초대 검증 플로우와 관련된 도메인.

## Routes

| 경로      | 페이지                    |
| --------- | ------------------------- |
| 팀 초대   | `src/pages/teamInvite/`   |
| 초대 수락 | `src/pages/inviteAccept/` |

초대 링크 경로와 토큰 파라미터는 `src/app/routes/paths.ts`와 router 설정을 먼저 확인한다.

## 주요 위치

```text
src/pages/teamInvite/
├── hooks/    # useTeamInvite
└── ui/       # TeamInvitePage

src/pages/inviteAccept/
├── hooks/    # useInviteAccept
├── model/    # invite page-local 타입
└── ui/       # InviteAcceptPage, InvalidInvite

src/shared/api/invitation/
src/shared/api/team/
```

## 작업 기준

- 초대 토큰, 만료, 이미 참여한 사용자, 권한 없음 상태를 구분한다.
- 초대 수락 후 team membership invalidation과 active team 갱신 여부를 확인한다.
- 팀 관련 mutation은 `shared/api/team/invalidateTeamMembership.ts` 패턴을 우선 확인한다.
- 링크 복사/공유는 browser/native capability fallback을 고려한다.

## 검증

- hook 상태 전이: `useInviteAccept.test.ts`, `useTeamInvite.test.ts`
- 사용자 플로우: Playwright invite/team spec
- team cache 영향: query invalidation 확인
