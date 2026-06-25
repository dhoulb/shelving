# Environment variable helpers

These helpers read `process.env` safely across Node, edge runtimes, and browser environments, where `process` may not exist. They follow the standard `get*` / `require*` pattern: `get*` returns `undefined` on miss, `require*` throws `RequiredError`.

**Things to know:**

- All functions return `undefined` (or throw) silently in browser environments where `process.env` does not exist — no runtime error is thrown for the missing global.
- `getEnvBoolean()` recognises `1`, `on`, `yes`, `true` as `true` and `0`, `off`, `no`, `false` as `false` (case-insensitive). Any other value returns `undefined`.

## Usage

```ts
import { getEnv, requireEnv, getEnvBoolean, requireEnvBoolean } from "shelving/util";

// Safe read — returns undefined if missing.
const port = getEnv("PORT");             // "3000" | undefined

// Throws RequiredError if missing.
const secret = requireEnv("API_SECRET"); // "abc123" or throws

// Boolean env var — returns true/false/undefined.
const debug = getEnvBoolean("DEBUG");    // true | false | undefined

// Throws if the value isn't a recognised boolean.
const verbose = requireEnvBoolean("VERBOSE"); // true | false or throws
```
