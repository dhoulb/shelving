# UUID helpers

Three small helpers for generating and validating UUIDs. They exist to provide a normalised, dash-free UUID format and a safe way to parse untrusted input strings.

**Things to know:**

- All UUIDs in this module are stored and returned **without dashes** — 32 lowercase hex characters. Dashes are stripped on input and never added on output.
- `randomUUID()` uses `crypto.randomUUID()` internally, so it requires a secure context (available in Node.js and modern browsers).
- `getUUID()` accepts hyphenated UUIDs, dash-free UUIDs, and mixed-case variants — it normalises them all to the same 32-char lowercase form.

## Usage

```ts
import { randomUUID, getUUID, requireUUID } from "shelving/util";

// Generate a new UUID.
randomUUID(); // "550e8400e29b41d4a716446655440000"  (no dashes)

// Parse and normalise an existing UUID.
getUUID("550e8400-e29b-41d4-a716-446655440000"); // "550e8400e29b41d4a716446655440000"
getUUID("INVALID");                              // undefined
getUUID("");                                     // undefined

// Require a valid UUID or throw.
requireUUID("550e8400-e29b-41d4-a716-446655440000"); // "550e8400e29b41d4a716446655440000"
requireUUID("bad-value");                            // throws RequiredError
```

## See also

- [util](/util) — naming conventions and the full helper overview.
