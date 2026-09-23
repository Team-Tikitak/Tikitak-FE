# 커밋 컨벤션 (Commit Convention)

> Udacity Git Style Guide 기반 (`prefix: subject`)

## 커밋 메시지 형식

```
<prefix>: <subject>

<body>

<footer>
```

- `subject` 50자 이내 권장, 마침표 미사용
- `subject` 명사형/요약형
- `body` / `footer` 선택사항

## Prefix 목록

| prefix     | 의미                                   |
| ---------- | -------------------------------------- |
| `feat`     | 기능 추가                              |
| `fix`      | 버그 수정                              |
| `docs`     | 문서 수정                              |
| `style`    | UI/스타일 변경, 포맷팅(로직 변경 없음) |
| `refactor` | 리팩토링(기능 변경 없음)               |
| `test`     | 테스트 추가/수정                       |
| `chore`    | 설정/빌드/패키지 등                    |
| `hotfix`   | 긴급 수정(배포 후/서비스 중)           |

## Scope (선택)

```
feat(auth): 로그인 유효성 검사
fix(button): 클릭 이벤트 오류
docs(readme): 설치 가이드
```

## 본문(Body) (선택)

- 짧은 불릿 나열(2~5줄 권장)

```
fix(api): 네트워크 타임아웃 처리

- 타임아웃 재시도 로직
- 에러 메시지 분기
- 로딩 상태 정리
```

## 푸터(Footer) (선택)

```
Closes #123
Resolves #321
Related to #100

BREAKING CHANGE: ~~
- 마이그레이션: ~~
```
