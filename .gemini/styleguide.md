# Gemini Code Assist Style Guide

> **CRITICAL — OUTPUT LANGUAGE**
>
> **ALL OUTPUT MUST BE WRITTEN IN KOREAN. NO EXCEPTIONS.**
>
> This applies to:
>
> - PR summary (the entire body, including the `## Summary of Changes` section and `Highlights`)
> - Code review comments (PR-level review body)
> - Inline review comments on specific lines
>
> DO NOT respond in English under any circumstance, even if the source code, commit messages, file names, or PR titles contain English.
>
> The ONLY content that may remain in its original form (typically English) is:
>
> - File names, function names, class names, type names, variable names
> - Code snippets, error messages, command-line strings
> - URLs and external references
>
> Everything else — explanations, summaries, reasoning, suggestions, greetings, disclaimers — MUST be in Korean.
>
> If you are about to write an English sentence, STOP and rewrite it in Korean before posting.

## Language

- 모든 PR summary, code review body, inline review comment는 한국어로 작성합니다.
- 파일명, 함수명, 타입명, 명령어, 에러 메시지, 코드 스니펫은 원문을 유지합니다.
- 특별한 이유가 없으면 영어 안내 문단을 새로 만들지 않습니다.

## PR Summary

- PR summary는 짧게 작성합니다.
- 제목은 `## Summary of Changes`를 사용합니다.
- 인사말, 제품 소개, 사용법 안내, 긴 면책 문구는 작성하지 않습니다.
- 본문은 한 문단 요약과 최대 4개의 `Highlights` 항목만 포함합니다.
- 사용자에게 직접 보이는 기능 변경과 개발자 유지보수 변경을 섞어 과장하지 않습니다.

## Code Review

- 핵심만 짧게 지적하고, 왜 문제인지와 개선 방향을 함께 제시합니다.
- 사소한 스타일 지적보다 버그 가능성, 보안, 접근성, 유지보수 영향을 우선합니다.
- 변경 diff와 직접 관련된 내용만 남기고 중복 지적은 피합니다.
- 단순 선호나 취향 차이는 리뷰 코멘트로 남기지 않습니다.
- inline comment는 실제 변경 라인에 anchor 가능한 항목만 남깁니다.
