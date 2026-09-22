---
name: react-performance
description: React SPA 성능 최적화 가이드. 카테고리별 규칙을 기반으로 코드를 분석하고 개선점을 제안합니다.
user-invocable: true
argument-hint: [file-or-directory]
allowed-tools: Bash, Read, Grep, Glob
---

# React 성능 최적화 가이드

6개 카테고리, 영향도순 정렬.

## 카테고리

| 우선순위 | 카테고리                        | 설명                         | 규칙 |
| -------- | ------------------------------- | ---------------------------- | ---- |
| CRITICAL | [async](rules/async.md)         | 비동기 병렬 처리, defer 패턴 | 3    |
| CRITICAL | [bundle](rules/bundle.md)       | 번들 최적화, 동적 import     | 4    |
| HIGH     | [rerender](rules/rerender.md)   | 리렌더링 방지, 상태 설계     | 6    |
| HIGH     | [rendering](rules/rendering.md) | 조건부 렌더링, useTransition | 4    |
| MEDIUM   | [js](rules/js.md)               | JS 성능 패턴, 캐싱, 자료구조 | 5    |
| LOW      | [advanced](rules/advanced.md)   | 고급 패턴, ref 활용          | 3    |

## 워크플로우

1. 대상 파일/디렉토리 읽기
2. 카테고리별 규칙 위반 확인
3. 영향도순으로 이슈 보고
4. 코드 수정 제안 (승인 후 적용)

## 규칙

- CRITICAL/HIGH 이슈 우선 보고
- 실제 코드를 읽은 후에만 제안
- 과도한 최적화 피하기 — 측정 가능한 병목에만 적용
