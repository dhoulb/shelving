#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote) containers.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
	exit 0
fi

# Run in the background so the session can start without waiting for the install.
echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# Remote containers ship whatever Bun version was current when the image was built, which
# can be older than this project needs (Bun < 1.4 does not hash `animation-name` to match
# its `@keyframes`, so `bun run test` fails). `engines.bun` in `package.json` holds the
# floor — the same range `oven-sh/setup-bun` reads in CI — so upgrade when we are below it.
minimum=$(bun --print 'require("./package.json").engines.bun.replace(/[^0-9.]/g, "")')
if [ "$(printf '%s\n%s\n' "$minimum" "$(bun --version)" | sort --version-sort | head -n 1)" != "$minimum" ]; then
	bun upgrade
fi

# Install dependencies so linters and tests are ready.
bun install
