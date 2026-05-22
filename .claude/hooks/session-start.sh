#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote) containers.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
	exit 0
fi

# Run in the background so the session can start without waiting for the install.
echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# Install dependencies so linters and tests are ready.
bun install
