#!/bin/bash

# PreToolUse hook: block common project rule violations.
# Claude Code passes the PreToolUse JSON payload (incl. tool_input) on stdin,
# not via an env var. Read stdin and grep the raw JSON text.
INPUT="$(cat)"

# Block console.log.
if echo "$INPUT" | grep -q 'console\.log'; then
  echo 'Avoid console.log. Use the project logging/debugging approach instead.' >&2
  exit 2
fi

# Block explicit any.
if echo "$INPUT" | grep -qE ':\s*any([^A-Za-z]|$)|<any>|as any'; then
  echo 'Avoid explicit any. Use a specific type or unknown.' >&2
  exit 2
fi

# Block npm/pnpm/npx commands in this Yarn project.
if echo "$INPUT" | grep -qE '(^|[[:space:]])(npm|pnpm|npx)[[:space:]]'; then
  echo 'Use yarn commands in this project.' >&2
  exit 2
fi
