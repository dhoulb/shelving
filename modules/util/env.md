# Environment variable helpers

These helpers read `process.env` safely across Node, edge runtimes, and browser environments, where `process` may not exist. They follow the standard `get*` / `require*` pattern: `get*` returns `undefined` on miss, `require*` throws [`RequiredError`](/error/RequiredError).

**Things to know:**

- All functions return `undefined` (or throw) silently in browser environments where `process.env` does not exist — no runtime error is thrown for the missing global.
- [`getEnvBoolean()`](/util/env/getEnvBoolean) recognises `1`, `on`, `yes`, `true` as `true` and `0`, `off`, `no`, `false` as `false` (case-insensitive). Any other value returns `undefined`.
- `NO_COLOR` is a module-level constant evaluated at import time, matching the [no-color.org](https://no-color.org) convention.

## Usage

```ts
import { getEnv, requireEnv, getEnvBoolean, requireEnvBoolean, NO_COLOR } from "shelving/util";

// Safe read — returns undefined if missing.
const port = getEnv("PORT");             // "3000" | undefined

// Throws RequiredError if missing.
const secret = requireEnv("API_SECRET"); // "abc123" or throws

// Boolean env var — returns true/false/undefined.
const debug = getEnvBoolean("DEBUG");    // true | false | undefined

// Throws if the value isn't a recognised boolean.
const verbose = requireEnvBoolean("VERBOSE"); // true | false or throws

// Module-level constant — false when NO_COLOR is not set.
if (!NO_COLOR) process.stdout.write("\x1b[32mgreen\x1b[0m");
```

## See also

- [util](/util) — full util module overview.
- [error](/error) — [`RequiredError`](/error/RequiredError) thrown by [`requireEnv()`](/util/env/requireEnv) and [`requireEnvBoolean()`](/util/env/requireEnvBoolean).
