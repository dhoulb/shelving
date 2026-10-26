# shelving/util/data

- Kind: module
- Import: `import { … } from "shelving/util/data";`

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


## Functions

- [isData()](data/isData.md): Is an unknown value a data object?
- [assertData()](data/assertData.md): Assert that an unknown value is a data object.
- [isDataProp()](data/isDataProp.md): Is an unknown value the key for an own prop of a data object?
- [assertDataProp()](data/assertDataProp.md): Assert that an unknown value is the key for an own prop of a data object.
- [getDataProps()](data/getDataProps.md): Get the props of a data object as a set of entries.
- [getDataKeys()](data/getDataKeys.md): Get the keys of a data object as an array.
- [splitDataPath()](data/splitDataPath.md): Split a dotted path into data path segments.
- [joinDataPath()](data/joinDataPath.md): Join a set of data path segments into a dotted path string.
- [getDataProp()](data/getDataProp.md): Get an optional (possibly deep) prop from a data object, or undefined if it doesn't exist.

## Types

- [Data](data/Data.md): Data object — a plain object with string keys and unknown values.
- [PartialData](data/PartialData.md): Partial data object (values can be explicitly undefined).
- [DataKey](data/DataKey.md): Helper type to get the key for a data object prop.
- [DataValue](data/DataValue.md): Helper type to get the value for a data object prop.
- [DataProp](data/DataProp.md): Helper type to get a prop for a data object. i.e. DataProp<{ a: number }> produces readonly ["a", number"]
- [BranchData](data/BranchData.md): Helper type to get a flattened data object with every branch node of the data, flattened into a.c.b format. i.e. BranchData<{ a: { a2: number } }> produces { "a": object, "a.a2": number }
- [BranchDataPath](data/BranchDataPath.md): Helper type to get the path for a flattened data object with deep paths flattened into a.c.b format.
- [BranchDataValue](data/BranchDataValue.md): Helper type to get the value for a flattened data object with deep paths flattened into a.c.b format.
- [BranchDataProp](data/BranchDataProp.md): Helper type to get the prop for a flattened data object with deep paths flattened into a.c.b format.
- [BranchDataSegments](data/BranchDataSegments.md): Typed path tuple for every branch node of a data object (including intermediate objects). i.e. BranchPath<{ a: number, b: { c: string } }> produces readonly ["a"] | readonly ["b"] | readonly ["b", "c"]
- [LeafData](data/LeafData.md): Helper type to get a flattened data object with only leaf nodes of the data, flattened into a.c.b format. i.e. LeafData<{ a: { a2: number } }> produces { "a.a2": number }
- [LeafDataPath](data/LeafDataPath.md): Helper type to get the leaf paths for a flattened data object with deep paths flattened into a.c.b format.
- [LeafDataValue](data/LeafDataValue.md): Helper type to get the leaf values for a flattened data object with deep paths flattened into a.c.b format.
- [LeafDataProp](data/LeafDataProp.md): Helper type to get the leaf props for a flattened data object with deep paths flattened into a.c.b format.
- [LeafDataSegments](data/LeafDataSegments.md): Typed path tuple for only leaf nodes of a data object. i.e. LeafPath<{ a: number, b: { c: string } }> produces readonly ["a"] | readonly ["b", "c"]
- [NestedData](data/NestedData.md): Object with one level of data nested beneath each prop. i.e. { A: { a: number }, B: { b: string } }
- [FlatData](data/FlatData.md)
