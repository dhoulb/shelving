# Debug formatting helpers

Convert any JavaScript value to a readable debug string. Use these when building error messages, logging, or printing diagnostic output — they produce compact, human-readable representations without relying on `JSON.stringify` (which omits `undefined`, symbols, functions, and circular refs).

- [`debug()`](/util/debug/debug) dispatches to the specialised helpers below based on the value's type; pass a `depth` argument to control how deeply nested structures are expanded (default `1`).
- [`debugFullRequest()`](/util/debug/debugFullRequest) and [`debugFullResponse()`](/util/debug/debugFullResponse) are async because they read the body stream; they clone the message first so the original remains usable.
- Body reads are capped at 64 KB — larger bodies are truncated with a `[truncated at N bytes]` note.

## Usage

### General-purpose debug

```ts
import { debug } from "shelving/util";

debug(null);              // "null"
debug(42);                // "42"
debug("hello\nworld");    // '"hello\\nworld"'
debug(new Date("2024-01-01")); // "2024-01-01T00:00:00.000Z"
debug([1, 2, 3]);         // "[\n\t1,\n\t2,\n\t3\n]"
debug({ a: 1 }, 0);       // "{}" (depth 0 suppresses contents)
```

### Strings, objects, arrays, maps, sets

```ts
import { debugString, debugObject, debugArray, debugMap, debugSet } from "shelving/util";

debugString('say "hi"');    // '"say \\"hi\\""'
debugObject({ x: 1 });      // "{\n\t\"x\": 1\n}"
debugArray([1, 2]);          // "[\n\t1,\n\t2\n]"
```

### HTTP requests and responses

```ts
import { debugRequest, debugResponse, debugHeaders } from "shelving/util";
import { debugFullRequest, debugFullResponse } from "shelving/util";

debugRequest(req);   // "GET https://example.com/api"
debugResponse(res);  // "200 OK"

// Async — includes headers and body:
const full = await debugFullRequest(req);
const full2 = await debugFullResponse(res);
```

### Indenting multiline strings

```ts
import { indent } from "shelving/util";

indent("single line");    // " single line"  (leading space)
indent("line1\nline2");   // "\n\tline1\n\tline2"
```

## See also

- [util](/util) — full util module overview
