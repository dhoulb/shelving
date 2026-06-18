# ValueError

Thrown when a value was present but invalid in its context — for example data read from a database or an external source that failed validation. Pass the offending value as `received` so it appears in structured logs.

## Usage

```ts
import { ValueError } from "shelving/error";

function parseConfig(raw: unknown): Config {
  if (!isConfig(raw)) throw new ValueError("Invalid config from server", { received: raw });
  return raw;
}
```

See [`shelving/error`](/error) for shared behaviour — attaching context fields, `caller` trimming, and catching by type.

## See also

- [`shelving/error`](/error) — module overview and shared error behaviour.
