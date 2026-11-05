# serialise()

- Kind: function
- Import: `import { serialise } from "shelving/util/serialise";`

Serialise any value to a stable, consistent string (a `JSON.stringify()` that never loses information).
- Not optimised for performance. Optimised for consistency!
- Allows returned values to be used for fingerprinting values of any type.
- Non-JSON-friendly values (like `null`, explicit `undefined`, symbols, functions) are converted to `{ $type: "symbol" }` style constructions.
- Objects with custom `toString()` properties assume that string is useful and return a value like `{ $type: "Date", value: "Wed Feb 24 2021 20:59:57 GMT+0000 (Greenwich Mean Time)" }`
- Object properties are sorted (by key) before output so they're always consistent.

A single `serialise()` function that converts any JavaScript value to a stable, deterministic string. Designed for fingerprinting and cache-key generation, not for data transport.

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


## Signatures

```ts
serialise(value: unknown): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `unknown` | The value to serialise (any type is accepted). |

## Returns

| Type | Description |
| --- | --- |
| `string` | A consistent string representation of `value`, suitable for fingerprinting or equality comparison. |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `value` cannot be serialised. |
