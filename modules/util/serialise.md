# Serialise

A single [`serialise()`](/util/serialise/serialise) function that converts any JavaScript value to a stable, deterministic string. Designed for fingerprinting and cache-key generation, not for data transport.

**Things to know:**

- Object properties are always sorted by key before output, so two objects with the same properties in different insertion order produce identical strings.
- Values that JSON cannot represent (`undefined`, symbols, functions) are encoded as `{"$type":"..."}` objects rather than being dropped or converted to `null`.
- Objects with a custom `toString()` are encoded as `{"$type":"ClassName","value":"..."}` — useful for `Date`, `Map`, and similar.
- This is not `JSON.stringify()`. Do not use it for data serialisation or network payloads.

## Usage

```ts
import { serialise } from "shelving/util";

// Primitives
serialise(true);        // "true"
serialise(42);          // "42"
serialise("hello");     // '"hello"'
serialise(null);        // "null"
serialise(undefined);   // '{"$type":"undefined"}'

// Arrays
serialise([1, "two", null]); // '[1,"two",null]'

// Objects — keys are sorted
serialise({ b: 2, a: 1 }); // '{"a":1,"b":2}'

// Dates — uses toString()
serialise(new Date("2024-01-01")); // '{"$type":"Date","value":"Mon Jan 01 2024 ..."}'

// Symbols and functions
serialise(Symbol("tag"));    // '{"$type":"symbol","description":"tag"}'
serialise(function foo() {}); // '{"$type":"function","name":"foo"}'
```

### Using as a cache key

```ts
import { serialise } from "shelving/util";

const key = serialise({ filter: "active", page: 2 });
// Always '{"filter":"active","page":2}' regardless of property insertion order
cache.get(key);
```
