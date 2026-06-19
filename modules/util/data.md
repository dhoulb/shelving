# Data objects

The `Data` type and its helpers are the foundation of Shelving's data layer. A `Data` object is a plain `Record<string, unknown>` — a JSON-safe object with no class prototype. Every database document, query result, and schema-validated value is a `Data`.

- Deep paths use dot notation: `"user.address.city"` or the equivalent tuple `["user", "address", "city"]`.
- `getDataProp()` never throws — it returns `undefined` for missing or non-object intermediate nodes.
- `splitDataPath()` / `joinDataPath()` are inverses of each other; both accept either form so you can freely convert.

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
| `Data` | Base plain-object type |
| `PartialData<T>` | All keys optional |
| `DataKey<T>` | Union of string keys |
| `DataValue<T>` | Union of value types |
| `LeafData<T>` | Flat object with only leaf paths |
| `LeafDataPath<T>` | Union of dotted leaf paths |
| `BranchData<T>` | Flat object including intermediate object paths |
| `NestedData` | One level of nesting: `{ Group: { key: value } }` |
| `FlatData<T>` | Flattened union of nested data |

```ts
import type { Data, LeafDataPath } from "shelving/util";

type Profile = { name: string; address: { city: string } };
type ProfileLeafPaths = LeafDataPath<Profile>; // "name" | "address.city"
```
