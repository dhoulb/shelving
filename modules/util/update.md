# Update helpers

`Updates<T>` is the mutation language for Shelving data objects. An updates object uses encoded key prefixes to describe how each field should change — set, increment, or add/remove array items — and `updateData()` applies those changes immutably. This is the format consumed by the [`shelving/db`](/db) layer when writing documents.

**Things to know:**

- `updateData()` returns the **same reference** when no property actually changes, making it safe for equality checks and memoisation.
- Nested fields are addressed with dot-path keys: `"=user.name"` targets `data.user.name`.
- If a `+=` or `-=` target field is not already a number, the increment value becomes the new value.
- If a `+[]` target field is not already an array, the value(s) become the new array.
- `getUpdates()` parses an `Updates` object into an array of structured `Update` objects — useful when you need to inspect or forward updates programmatically.

## Usage

### Key prefix syntax

| Key syntax | Action |
| --- | --- |
| `key` or `=key` | Set field to value |
| `+=key` | Increment number |
| `-=key` | Decrement number |
| `+[]key` | Add item(s) to array |
| `-[]key` | Remove item(s) from array |

Use plain `key` for most sets. Use `=key` when TypeScript inference gets confused by deeply-nested paths — the `=` prefix forces leaf-only matching and is more precise.

### Applying updates

```ts
import { updateData } from "shelving/util";

const doc = { title: "Draft", count: 5, tags: ["a", "b"] };

updateData(doc, { title: "Published" });        // { title: "Published", count: 5, tags: [...] }
updateData(doc, { "=title": "Final" });         // same effect, more precise
updateData(doc, { "+=count": 3 });              // { ..., count: 8, ... }
updateData(doc, { "-=count": 1 });              // { ..., count: 4, ... }
updateData(doc, { "+[]tags": "c" });            // { ..., tags: ["a", "b", "c"] }
updateData(doc, { "-[]tags": "a" });            // { ..., tags: ["b"] }
updateData(doc, { "+[]tags": ["c", "d"] });     // add multiple at once
```

### Nested paths

```ts
import { updateData } from "shelving/util";

const doc = { user: { name: "Alice", score: 10 } };

updateData(doc, { "=user.name": "Bob" });       // { user: { name: "Bob", score: 10 } }
updateData(doc, { "+=user.score": 5 });         // { user: { name: "Alice", score: 15 } }
```

### Inspecting updates

```ts
import { getUpdates } from "shelving/util";

getUpdates({ "+=count": 1, "-[]tags": "old" });
// [
//   { action: "sum",  key: ["count"], value: 1 },
//   { action: "omit", key: ["tags"],  value: ["old"] },
// ]
```
