# 미니게임 점수 저장

미니게임(티키 날기, 탁 잡기)의 팀 월간 리더보드를 어디에 어떻게 저장하는지에 대한 결정.

## 리더보드를 메인 백엔드 대신 Supabase에 저장

- 상태: accepted
- 기록일: 2026-11-19

**결정**: 미니게임 점수만 Supabase(PostgREST)에 저장한다. 메인 API(`instance`)와 섞지 않고
`shared/api/game/supabase.ts`의 전용 axios 인스턴스(`gameInstance`)로 호출한다.

**근거**:

- 메인 백엔드 DB에 접근할 수 없는 상태에서 점수만 따로 둘 수 있다. 점수는 잃어도 큰 문제가
  없는 데이터라 별도 저장소가 부담이 적다.
- 호출은 REST(PostgREST)라 `@supabase/supabase-js` 없이 axios로 충분하다.
- 나중에 메인 백엔드에 API가 생기면 `shared/api/game/`만 바꾸면 되도록 서버 호출을 한 폴더에 모았다.

**⚠️ 주의**:

- Supabase는 우리 로그인·팀 멤버십을 모른다. 클라이언트가 보낸 `member_id`를 그대로 믿으므로
  다른 사람 이름으로 점수를 낼 수 있다. 지인 팀 안의 가벼운 경쟁이라 허용하고, 서버(RPC)에서
  점수 상한만 검증한다. 엄밀한 신원 확인이 필요해지면 Edge Function으로 토큰을 검증하는 방식으로 올린다.
- 저장은 `team_id`·`member_id`·`month`·`score`만 한다. 닉네임·프로필은 저장하지 않고
  `useTeamMembers`의 팀원 목록과 화면에서 합친다(`buildFlappyLeaderboard`). 닉네임이 바뀌어도 반영되고,
  팀을 나간 사람은 목록에서 빠진다.
- 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 없으면 리더보드 요청을 보내지 않는다
  (`isGameServerConfigured`).
- Supabase 무료 플랜은 일정 기간 접속이 없으면 프로젝트가 일시 중지될 수 있다. 중지되면 리더보드만
  비어 보이고 게임은 동작한다.

## 스키마와 접근 정책

- 상태: accepted
- 기록일: 2026-11-19

> **구현 상태 (2026-11-19 확인): 프론트만 구현.** 아래 SQL은 Supabase 프로젝트에 직접 실행해야 한다.

**결정**: 게임이 여러 개라 점수는 `game_scores` 한 테이블에 `game_id`로 구분해 저장한다. 테이블 직접 쓰기는
막고, 점수 제출은 RPC 함수로만 연다. 읽기만 anon에 허용한다. 모든 게임은 "높을수록 좋은 점수"로 통일한다.

```sql
create table public.game_scores (
  game_id   text   not null check (game_id in ('flappy', 'whack', 'keycap')),
  team_id   bigint not null,
  member_id bigint not null,
  month     text   not null check (month ~ '^\d{4}-\d{2}$'), -- 한국 시간 기준 YYYY-MM
  score     int    not null check (score between 0 and 999),
  updated_at timestamptz not null default now(),
  primary key (game_id, team_id, member_id, month)
);

alter table public.game_scores enable row level security;

-- 읽기만 허용. insert/update/delete 정책이 없어서 테이블 직접 쓰기는 모두 막힌다.
create policy "anon can read scores" on public.game_scores
  for select to anon using (true);

-- 프로젝트 생성 시 "Grant API access to new tables automatically"를 끄면 권한이 없으므로 읽기만 직접 부여한다.
grant select on public.game_scores to anon;

-- 최고 점수만 갱신. security definer라 RLS를 우회해 이 함수로만 쓸 수 있다.
create or replace function public.submit_game_score(
  p_game_id text, p_team_id bigint, p_member_id bigint, p_month text, p_score int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_game_id not in ('flappy', 'whack', 'keycap')
     or p_score < 0 or p_score > 999
     or p_month !~ '^\d{4}-\d{2}$' then
    raise exception 'invalid score';
  end if;

  insert into public.game_scores (game_id, team_id, member_id, month, score)
  values (p_game_id, p_team_id, p_member_id, p_month, p_score)
  on conflict (game_id, team_id, member_id, month)
  do update set score = greatest(public.game_scores.score, excluded.score),
                updated_at = now();
end;
$$;

grant execute on function public.submit_game_score(text, bigint, bigint, text, int) to anon;
```

이미 `flappy_scores`와 `submit_flappy_score`를 만들어 둔 경우에는 위 대신 아래로 옮긴다(기존 점수는 `flappy`로 유지된다).

```sql
alter table public.flappy_scores rename to game_scores;
alter table public.game_scores add column game_id text not null default 'flappy';
alter table public.game_scores alter column game_id drop default;
alter table public.game_scores drop constraint flappy_scores_pkey;
alter table public.game_scores add primary key (game_id, team_id, member_id, month);
alter table public.game_scores
  add constraint game_scores_game_id_check check (game_id in ('flappy', 'whack', 'keycap'));

drop function public.submit_flappy_score(bigint, bigint, text, int);

create or replace function public.submit_game_score(
  p_game_id text, p_team_id bigint, p_member_id bigint, p_month text, p_score int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_game_id not in ('flappy', 'whack', 'keycap')
     or p_score < 0 or p_score > 999
     or p_month !~ '^\d{4}-\d{2}$' then
    raise exception 'invalid score';
  end if;

  insert into public.game_scores (game_id, team_id, member_id, month, score)
  values (p_game_id, p_team_id, p_member_id, p_month, p_score)
  on conflict (game_id, team_id, member_id, month)
  do update set score = greatest(public.game_scores.score, excluded.score),
                updated_at = now();
end;
$$;

grant execute on function public.submit_game_score(text, bigint, bigint, text, int) to anon;
```

이미 `flappy`, `whack`용으로 만들어 둔 상태에서 `keycap`만 추가할 때는 아래만 실행한다.

```sql
alter table public.game_scores drop constraint game_scores_game_id_check;
alter table public.game_scores
  add constraint game_scores_game_id_check check (game_id in ('flappy', 'whack', 'keycap'));

create or replace function public.submit_game_score(
  p_game_id text, p_team_id bigint, p_member_id bigint, p_month text, p_score int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_game_id not in ('flappy', 'whack', 'keycap')
     or p_score < 0 or p_score > 999
     or p_month !~ '^\d{4}-\d{2}$' then
    raise exception 'invalid score';
  end if;

  insert into public.game_scores (game_id, team_id, member_id, month, score)
  values (p_game_id, p_team_id, p_member_id, p_month, p_score)
  on conflict (game_id, team_id, member_id, month)
  do update set score = greatest(public.game_scores.score, excluded.score),
                updated_at = now();
end;
$$;
```

**근거**:

- 게임을 추가할 때 테이블을 새로 만들지 않고 `game_id` 값(허용 목록)만 늘리면 된다.
- `(game_id, team_id, member_id, month)` 기본키라 월이 바뀌면 새 행이 생겨 별도 초기화 작업이 필요 없다.
- `greatest`로 최고 점수만 남기고, 상한(999)과 월 형식을 서버에서 검증한다.
- 월 키는 프론트의 `getGameMonth`(Asia/Seoul)와 같은 값을 쓴다.
- 서버 상한(999)을 넘는 점수는 거부되어 기록이 사라지므로, 제출 전에 `clampGameScore`로 상한에 맞춘다(`shared/api/game/selectors.ts`).
- 순위 조회는 **현재 팀원의 `member_id`만** 서버에서 걸러서(`member_id=in.(...)`) 가져온다. 탈퇴한 사람의 기록이 상위 50개를
  차지해도 현재 팀원의 기록이 밀려나지 않는다.
- 최고 점수 비교는 클라이언트가 아니라 서버의 `greatest`에 맡긴다. 화면의 월과 제출 시점의 월이 달라도 점수가 사라지지 않는다.
- 새 게임을 추가하면 SQL의 `game_id` 허용 목록과 `shared/api/game/types.ts`의 `GAME_IDS`를 같이 늘린다.

## 미니게임 효과음: 기본은 합성, 키 소리만 실제 녹음

- 상태: accepted
- 기록일: 2026-11-19

**결정**: 효과음은 Web Audio API로 합성한다(`shared/lib/sound`). 단, 키캡 배틀의 키 소리는 CC0 라이선스의
실제 키보드 녹음 샘플(`shared/assets/Sound/keypress-sprite.wav`, 16칸을 이은 스프라이트, HHKB Topre 방식의 깊은 타건음)을 쓰고, 아직 불러오지
못했거나 재생할 수 없으면 합성음으로 대신한다. 켜기/끄기와 키 소리 종류는 `useSoundStore`에 두고 `localStorage`에
저장한다. 게임의 첫 입력에서 `unlockAudio()`로 오디오를 깨운다.

**근거**:

- 뾱, 딩, 째깍, 두더지 타격음처럼 짧은 소리는 합성으로 충분해 파일이 필요 없다(용량·라이선스 부담 없음).
- 키 소리는 합성으로 진짜 타건음을 재현하기 어려워 실제 녹음을 쓴다. 출처와 가공 방법은
  `shared/assets/Sound/README.md`에 적었다(원본: Freesound grcekh의 HHKB 타이핑 녹음, CC0).
- "또각"은 기계식 키보드의 별도 CC0 녹음(누르고 떼는 한 쌍)을 쓴다. "묵직/딸깍/쫀득"은 HHKB 녹음 하나의
  재생 속도와 필터를 달리해 만든다. 모드마다 쓰는 녹음은 `sounds.ts`의 `KEY_FLAVORS`에서 정한다.
- 스프라이트 하나(약 184KB)만 받으면 돼서 요청이 한 번이다.

**⚠️ 주의**:

- 원본은 Freesound의 공개 미리듣기(mp3)라 원본 wav보다 음질이 조금 낮다. 다른 소리가 필요하면 CC0 샘플을 골라
  스프라이트를 다시 만들고 `KEY_SPRITE_*` 상수를 맞춘다.
- iOS 무음 스위치가 켜져 있으면 Web Audio 소리가 나지 않을 수 있다. 소리가 안 나도 햅틱은 동작한다.
  실제 기기에서 동작을 확인해야 한다.
- 모임이나 이동 중에 쓰는 앱이라 게임 헤더마다 `SoundToggle`을 둔다.

## 티키타닥은 단계별 결과를 점수 하나로 합쳐 저장

- 상태: accepted
- 기록일: 2026-11-19

**결정**: 티키타닥(`game_id = 'keycap'`)은 초보 → 중수 → 고수 → 초고수 순서로 컴퓨터를 이기며 올라가는
게임이다. 서버에는 한 판의 결과를 `클리어한 단계 수 × 1000 + 모든 단계에서 가져온 키캡 수(최대 999)` 한 숫자로
저장한다(`shared/lib/game/keycapScore.ts`). 화면에서는 `formatKeycapScore`로 "중수 클리어 · 31점"처럼 바꿔 보여준다.

**근거**:

- 서버의 `game_scores`는 "높을수록 좋은 점수 하나"만 받는다. 이렇게 합치면 테이블과 SQL을 바꾸지 않고도
  "높은 단계까지 간 사람이 먼저, 같은 단계면 많이 가져온 사람이 먼저"로 순위가 매겨진다.
- 최대 값이 4999라 키캡 점수만 서버 상한을 4999로 올린다(다른 게임은 999 그대로).
- 처음엔 ×100(키캡 최대 99)이었는데 "99점"이 상한인지 실제 점수인지 구분되지 않아 ×1000으로 바꿨다. 상한에 닿으면 "999점 이상"으로 보여준다.
- 단계를 더 늘려도 한 단계당 1000을 쓰므로 4단계를 넘어도 같은 방식으로 늘릴 수 있다.

```sql
-- 이미 ×100 방식으로 저장된 기록을 ×1000 방식으로 옮기고, 키캡만 상한을 4999로 올린다
alter table public.game_scores drop constraint game_scores_score_check;
alter table public.game_scores add constraint game_scores_score_check
  check (score between 0 and (case when game_id = 'keycap' then 4999 else 999 end));

update public.game_scores
set score = (score / 100) * 1000 + (score % 100)
where game_id = 'keycap' and score < 1000;
-- 위 update는 한 번만 실행한다(다시 실행하면 이미 옮긴 값은 건드리지 않지만, 1000 미만의 새 기록이 있으면 잘못 바뀐다)

-- submit_game_score의 점수 검사만 아래로 바꾼다
--   or p_score < 0 or p_score > case when p_game_id = 'keycap' then 4999 else 999 end
```

- 단계 난이도(컴퓨터의 반응 속도)는 `keycapEngine.ts`의 `STAGES`에서 조절한다.

## 이달의 게임왕 칭호

- 상태: accepted
- 기록일: 2026-11-19

**결정**: 활동 탭 월간 칭호에 "이달의 게임왕"을 더한다(`pages/activity/lib/monthlyTitles.ts`). 세 게임의 이번 달
순위를 가져와 1위 3점, 2위 2점, 3위 1점으로 합산해 가장 높은 사람이 받고, 점수가 같으면 1위를 더 많이 한 사람이
앞서며, 그래도 같으면 함께 받는다.

**근거**:

- 게임마다 점수 단위가 달라서(탁 잡기는 잡은 수, 티키타닥은 단계 점수) 점수를 합치지 않고 순위만 쓴다.
- 서버에 새 API나 테이블이 필요 없다. 이미 불러오는 게임별 순위표(`useGameLeaderboard`)로 화면에서 계산한다.
- 칭호가 따로따로 튀어나오지 않도록 기존 칭호와 같이 모든 데이터가 온 뒤 한 번에 보여준다.
