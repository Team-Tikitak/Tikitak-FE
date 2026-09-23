#!/bin/bash

# UserPromptSubmit hook: suggest project skills from prompt keywords.

PROMPT=$(printf '%s' "$CLAUDE_USER_PROMPT" | tr '[:upper:]' '[:lower:]')
SUGGESTIONS=""

add_suggestion() {
  SUGGESTIONS="${SUGGESTIONS}\n  $1"
}

if echo "$PROMPT" | grep -qE 'commit|staged|push'; then
  add_suggestion '/commit-kr - create a Korean commit message'
fi

if echo "$PROMPT" | grep -qE 'pr|pull request'; then
  add_suggestion '/create-pr - create a pull request'
fi

if echo "$PROMPT" | grep -qE 'refactor|cleanup|dedupe|simplify|리팩토링|리팩터링|정리해|중복|간소화'; then
  add_suggestion '/refactor - analyze refactoring opportunities'
fi

if echo "$PROMPT" | grep -qE 'test|vitest|tdd|coverage'; then
  add_suggestion '/gen-test - generate tests'
fi

if echo "$PROMPT" | grep -qE 'swagger|openapi|api generate|api client|api scaffold'; then
  add_suggestion '/scaffold-api - generate API types, clients, and query hooks'
fi

if echo "$PROMPT" | grep -qE 'bug|error|debug|fail|broken'; then
  add_suggestion 'omc:debugger - investigate and fix failures'
fi

if echo "$PROMPT" | grep -qE 'figma'; then
  add_suggestion '/figma-to-component - implement a Figma design as a component'
elif echo "$PROMPT" | grep -qE 'ui|ux|design|screen|layout|디자인|화면|레이아웃'; then
  add_suggestion '/figma-to-component - implement a Figma design as a component'
  add_suggestion 'omc:designer - improve UI/UX'
fi

if echo "$PROMPT" | grep -qE 'build|deploy'; then
  add_suggestion 'yarn build - verify production build'
fi

if [ -n "$SUGGESTIONS" ]; then
  echo -e "Suggested next steps:${SUGGESTIONS}"
fi
