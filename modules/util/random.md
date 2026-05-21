# Random helpers

Small utilities for generating random numbers, characters, and short human-readable keys. Useful for placeholder IDs, test data, and UI token generation.

**Things to know:**

- These helpers use `Math.random()` — they are **not** cryptographically secure.
- `getRandomKey()` omits visually ambiguous characters (`i`, `l`, `o`, `u`) to improve readability.
- Random keys can clash. Check for an existing record before saving one as a database ID.

## Usage

### Random numbers

```ts
import { getRandom, getRandomExcept } from "shelving/util";

getRandom(1, 10);            // integer between 1 and 10 inclusive
getRandom();                 // integer anywhere in safe integer range

getRandomExcept(5, 1, 10);  // integer between 1 and 10, never 5
```

### Random keys and characters

```ts
import { getRandomKey, getRandomCharacter, getRandomItem } from "shelving/util";

getRandomKey();      // e.g. "xs23r34hhsdx"  (12 chars, default)
getRandomKey(6);     // e.g. "e4m29k"         (6 chars)

getRandomCharacter("ABCDE");  // one of "A", "B", "C", "D", or "E"

getRandomItem(["apple", "banana", "cherry"]);  // one element at random
```
