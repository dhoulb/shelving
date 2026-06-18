# String hashing

Lightweight, deterministic string-to-number hashing. Useful for consistently mapping a string to a bucket — for example picking a stable colour, avatar, or index for a user or entity name without storing anything.

**Things to know:**

- The algorithm is intentionally simple (character code sum) — it is fast and stable but not cryptographic. Do not use it for security purposes.
- [`hashStringBetween()`](/util/hash/hashStringBetween) wraps the result into `[min, max)` using modular arithmetic, so the same string always produces the same number within the range.

## Usage

```ts
import { hashString, hashStringBetween } from "shelving/util";

hashString("alice");              // 527  (stable across calls)
hashString("bob");                // 313

// Map a username to one of 10 avatar colours.
const colorIndex = hashStringBetween("alice", 0, 10);  // 0–9
```
