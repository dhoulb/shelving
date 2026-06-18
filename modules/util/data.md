# Data objects

The [`Data`](/util/data/Data) type and its helpers are the foundation of Shelving's data layer. A `Data` object is a plain `Record<string, unknown>` — a JSON-safe object with no class prototype. Every database document, query result, and schema-validated value is a `Data`.

- Deep paths use dot notation: `"user.address.city"` or the equivalent tuple `["user", "address", "city"]`.
- [`getDataProp()`](/util/data/getDataProp) never throws — it returns `undefined` for missing or non-object intermediate nodes.
- [`splitDataPath()`](/util/data/splitDataPath) / [`joinDataPath()`](/util/data/joinDataPath) are inverses of each other; both accept either form so you can freely convert.

## Usage

### Type guards and assertions

```ts
import { isData, assertData } from "shelving/util";

isData({ name: "Alice" }); // true
isData(new Map());         // false
isData(null);              // false

assertData(value); // throws RequiredError if value is not a plain object
```

### Checking and accessing props

```ts
import { isDataProp, assertDataProp, getDataProps, getDataKeys } from "shelving/util";

const doc = { name: "Alice", age: 30 };

isDataProp(doc, "name");  // true
isDataProp(doc, "email"); // false

getDataKeys(doc);  // ["name", "age"]
getDataProps(doc); // [["name", "Alice"], ["age", 30]]
```

### Reading nested values with dot paths

```ts
import { getDataProp, splitDataPath, joinDataPath } from "shelving/util";

const doc = { user: { address: { city: "London" } } };

getDataProp(doc, "user.address.city");           // "London"
getDataProp(doc, ["user", "address", "city"]);   // "London"
getDataProp(doc, "user.missing.key");            // undefined

splitDataPath("user.address.city"); // ["user", "address", "city"]
joinDataPath(["user", "address", "city"]); // "user.address.city"
```

### TypeScript utility types

`data.ts` exports a rich set of mapped types for working with typed data objects:

| Type | Purpose |
| ---- | ------- |
| [`Data`](/util/data/Data) | Base plain-object type |
| [`PartialData<T>`](/util/data/PartialData) | All keys optional |
| [`DataKey<T>`](/util/data/DataKey) | Union of string keys |
| [`DataValue<T>`](/util/data/DataValue) | Union of value types |
| [`LeafData<T>`](/util/data/LeafData) | Flat object with only leaf paths |
| [`LeafDataPath<T>`](/util/data/LeafDataPath) | Union of dotted leaf paths |
| [`BranchData<T>`](/util/data/BranchData) | Flat object including intermediate object paths |
| [`NestedData`](/util/data/NestedData) | One level of nesting: `{ Group: { key: value } }` |
| [`FlatData<T>`](/util/data/FlatData) | Flattened union of nested data |

```ts
import type { Data, LeafDataPath } from "shelving/util";

type Profile = { name: string; address: { city: string } };
type ProfileLeafPaths = LeafDataPath<Profile>; // "name" | "address.city"
```

## See also

- [util](/util) — full util module overview including Items, Queries, and Updates that build on [`Data`](/util/data/Data)
- [`shelving/schema`](/schema) — schema validation that produces typed `Data` objects
- [`shelving/db`](/db) — database layer that stores and queries `Data` items
