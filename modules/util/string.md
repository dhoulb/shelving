# String helpers

Core helpers for checking, converting, sanitising, and transforming strings. Used throughout Shelving wherever user input is cleaned or URLs are generated.

**Things to know:**

- [`getString()`](/util/string/getString) converts `boolean`, `number`, `Date`, and arrays to strings but returns `undefined` for anything else (e.g. objects, `null`). Use [`requireString()`](/util/string/requireString) to throw instead.
- [`sanitizeText()`](/util/string/sanitizeText) is for single-line input (titles, labels). [`sanitizeMultilineText()`](/util/string/sanitizeMultilineText) is for longer content — it preserves `\n` but normalises everything else.
- [`simplifyString()`](/util/string/simplifyString) uses Unicode normalisation (`NFKD`) so accented/ligature characters (`é`, `ﬀ`) collapse to plain ASCII equivalents before stripping. This makes it reliable for search and slug generation.
- [`splitString()`](/util/string/splitString) differs from `String.prototype.split()` in that excess segments are concatenated onto the last segment rather than discarded, and it enforces min/max segment counts.
- [`getWords()`](/util/string/getWords) honours quoted phrases: `"hello world"` is one word, not two.

## Usage

### Type checking and conversion

```ts
import { isString, getString, requireString } from "shelving/util";

isString("hi");       // true
isString(42);         // false

getString(42);         // "42"
getString(true);       // "true"
getString(new Date()); // ISO string e.g. "2024-01-15T00:00:00.000Z"
getString({});         // undefined
```

### Length checks

```ts
import { isStringLength, assertStringLength } from "shelving/util";

isStringLength("hello", 1, 10); // true
isStringLength("", 1);          // false
```

### Sanitising user input

```ts
import { sanitizeText, sanitizeMultilineText } from "shelving/util";

sanitizeText("  Hello\x00  World  ");  // "Hello World"
sanitizeMultilineText("line1\r\nline2\n\n\nline3"); // "line1\nline2\n\nline3"
```

### Slugs and refs

```ts
import { simplifyString, getSlug, requireSlug, getRef } from "shelving/util";

simplifyString("Héllo Wörld! 😂"); // "hello world"
getSlug("Hello World!");           // "hello-world"
getSlug("!!!");                    // undefined (empty after simplification)
requireSlug("!!!");                // throws RequiredError
getRef("Hello World");             // "helloworld" (no separator)
```

### Word splitting and limiting

```ts
import { getWords, limitString, splitString, getFirstLine } from "shelving/util";

getWords(`hello "world foo" bar`);  // ["hello", "world foo", "bar"]
limitString("A long string here", 10); // "A long…"
splitString("a/b/c", "/", 2);         // ["a", "b/c"]  — excess joins last segment
getFirstLine("line one\nline two");    // "line one"
```

### Joining

```ts
import { joinStrings } from "shelving/util";

joinStrings(["a", "b", "c"], ", "); // "a, b, c"
```
