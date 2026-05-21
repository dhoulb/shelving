# Entry helpers

An **entry** is a `readonly [key, value]` pair — the shape produced by `Map.entries()`, `Object.entries()`, and `Array.entries()`. These helpers provide a uniform way to iterate, extract, and type entries across all of those sources.

## Usage

### Iterating entries from mixed sources

```ts
import { getEntries, getEntryKeys, getEntryValues } from "shelving/util";

const obj = { a: 1, b: 2 };
const map = new Map([["c", 3], ["d", 4]]);
const arr = [10, 20, 30];
const set = new Set(["x", "y"]);

// getEntries accepts objects, Maps, arrays, Sets, or any Entry iterable — including multiple at once.
for (const [k, v] of getEntries(obj, map)) { /* ... */ }
for (const [i, v] of getEntries(arr)) { /* ... */ }
for (const [k] of getEntries(set)) { /* ... */ } // Sets yield [value, value] entries

for (const k of getEntryKeys(getEntries(obj))) { /* k = "a", "b" */ }
for (const v of getEntryValues(getEntries(map))) { /* v = 3, 4 */ }
```

### Extracting from a single entry

```ts
import { getEntryKey, getEntryValue } from "shelving/util";

const entry = ["name", "Alice"] as const;
getEntryKey(entry);   // "name"
getEntryValue(entry); // "Alice"
```

### Using `EntryObject` to convert entries back to object types

```ts
import type { Entry, EntryObject } from "shelving/util";

type E = Entry<"status", "active" | "inactive">;
type O = EntryObject<E>; // { status: "active" | "inactive" }
```

## See also

- [util](/util) — full util module overview.
