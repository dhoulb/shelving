# Transform helpers

Map and transform values across arrays, objects, dictionaries, and async sequences. These are higher-order utilities that apply a function to every element or property of a collection.

**Things to know:**

- `mapItems` is a generator — it yields lazily and does not produce an array. Use `mapArray` when you need an `ImmutableArray`.
- `transformObject` returns the same reference when none of the transforms change a value, making it safe for equality checks and memoisation.
- `mapSequence` is for `AsyncIterable` streams; it is an async generator.

## Usage

### Arrays and iterables

```ts
import { mapItems, mapArray } from "shelving/util";

const doubled = mapArray([1, 2, 3], x => x * 2); // [2, 4, 6]

// Lazy — does not allocate an array:
for (const v of mapItems([1, 2, 3], x => x * 2)) { ... }
```

### Objects

```ts
import { mapProps, transformObject } from "shelving/util";

// Map all property values through a transform.
mapProps({ a: 1, b: 2 }, ([, v]) => v * 10); // { a: 10, b: 20 }

// Selectively transform named properties; same ref returned if nothing changed.
const result = transformObject(
  { name: "dave", age: 30 },
  { name: s => s.toUpperCase() },
); // { name: "DAVE", age: 30 }
```

### Dictionaries

```ts
import { mapDictionary } from "shelving/util";

mapDictionary({ x: 1, y: 2 }, v => v + 100); // { x: 101, y: 102 }
```

### Entries

```ts
import { mapEntries, mapEntryValues } from "shelving/util";

// mapEntries passes the full [key, value] entry to the transform.
// mapEntryValues passes only the value.
const entries: [string, number][] = [["a", 1], ["b", 2]];
Array.from(mapEntryValues(entries, v => v * 2)); // [["a", 2], ["b", 4]]
```

### Async sequences

```ts
import { mapSequence } from "shelving/util";

async function* process(stream: AsyncIterable<string>) {
  yield* mapSequence(stream, line => line.trim());
}
```

## See also

- [util](/util) — Overview of all util helpers.
