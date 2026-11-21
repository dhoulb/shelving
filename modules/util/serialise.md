# Serialise

A single `serialise()` function that converts any JavaScript value to a stable, deterministic string. Designed for fingerprinting and cache-key generation, not for data transport.

**Things to know:**

- Object properties are sorted by key at every depth, so two objects with the same properties in a different order give the same string.
- Values that JSON cannot hold (`undefined`, symbols, functions, `NaN`, `Infinity`, bigints) are encoded as `{"$type":"..."}` objects, not dropped or turned into `null`.
- Objects with their own `toString()` (like `Date`) are encoded as `{"$type":"ClassName","value":"..."}`.
- It is built on `JSON.stringify()`, so strings are escaped correctly and it is fast.
- Treat the output as an opaque string. Compare it for equality, but do not parse it or read data from it. Its format can change. Do not use it for data transport or network payloads.
- `getQueryKey()` uses it to make query cache keys.

## Usage

```ts
import { serialise } from "shelving/util";

// Primitives
serialise(true); // "true"
serialise(42); // "42"
serialise("hello"); // '"hello"'
serialise(null); // "null"
serialise(undefined); // '{"$type":"undefined"}'

// Arrays
serialise([1, "two", null]); // '[1,"two",null]'

// Objects — keys are sorted
serialise({ b: 2, a: 1 }); // '{"a":1,"b":2}'

// Dates — uses toString()
serialise(new Date("2024-01-01")); // '{"$type":"Date","value":"Mon Jan 01 2024 ..."}'

// Symbols and functions
serialise(Symbol("tag")); // '{"$type":"symbol","description":"tag"}'
serialise(function foo() {}); // '{"$type":"function","name":"foo"}'
```

### Using as a cache key

```ts
import { serialise } from "shelving/util";

const key = serialise({ filter: "active", page: 2 });
// Always '{"filter":"active","page":2}' regardless of property insertion order
cache.get(key);
```
