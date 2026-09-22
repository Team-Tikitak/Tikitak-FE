# Domain: User / MyPage

내 정보·내가 속한 팀 목록.

## 라우트

| 경로      | 페이지              |
| --------- | ------------------- |
| `/mypage` | `src/pages/myPage/` |
| `/home`   | `src/pages/home/`   |

`paths.ts`: `PATHS.MY_PAGE`, `PATHS.HOME`.

## 핵심 타입

```ts
// src/pages/myPage/model/types.ts
import type { TeamRole, TeamStatus } from '@/shared/types';

export interface TeamItem {
  teamId: number;
  teamMemberId: number;
  name: string;
  description: string;
  teamImageUrl: string;
  role: TeamRole;
  memberStatus: TeamStatus;
  teamStatus: TeamStatus;
  nickname: string;
  profileImageUrl: string;
  memberCount: number;
  isActive: boolean;
  joinedAt: string;
}
```

`TeamItem`은 마이페이지의 "내 팀 목록" 표시용. `TeamDetail`과 별개 (목록 vs 상세 분리).
`TeamRole`, `TeamStatus`는 `shared/types`에서 import — `team.md` 참조.

## 작업 시 주의

- `TeamItem.isActive` — `teamStatus === 'ACTIVE'` && `memberStatus === 'ACTIVE'` 파생 값. 백엔드 응답에 포함되면 그대로 사용, 아니면 클라이언트 파생.
- 목록 → 상세 이동은 `toTeamDetail(teamItem.teamId)` 헬퍼 사용 (`paths.ts`).
- 사용자 프로필 수정 API·페이지 미구현. 추후 `shared/api/user/` 신설 예정.

## 미구현·TODO

- 내 팀 목록 API 연결 (현재 mock 또는 미연결)
- 프로필 수정 페이지
- 로그아웃 처리 (auth 도메인 연계)
