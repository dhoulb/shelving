# Items

The [`Item`](/util/item/Item) type and its helpers. An `Item` is a [`Data`](/util/data/Data) object — a plain JSON-safe record — that also carries an `id` of type `string | number`. Every database collection in Shelving operates on items, so this is the fundamental unit of persisted data.

**Things to know:**

- [`getItem()`](/util/item/getItem) returns the same reference if `data` already has that `id` — safe for use in equality checks and memoisation.
- [`getIdentifiers()`](/util/item/getIdentifiers) is a generator; wrap it in `Array.from()` to materialise the list.

## Usage

### Creating items

```ts
import { getItem } from "shelving/util";

const item = getItem("abc", { name: "Widget", price: 9 });
// { id: "abc", name: "Widget", price: 9 }

// Same reference if id is already correct.
getItem("abc", item) === item; // true
```

### Reading identifiers

```ts
import { getIdentifier, getIdentifiers, hasIdentifier } from "shelving/util";

getIdentifier(item);              // "abc"
hasIdentifier(item, "abc");       // true
hasIdentifier(item, "xyz");       // false

const ids = Array.from(getIdentifiers([item1, item2]));
// ["abc", "def"]
```

### Typing items

```ts
import type { Item, Items, OptionalItem, Identifier } from "shelving/util";

type ProductItem = Item<string, { name: string; price: number }>;

function findProduct(id: string, products: Items<string, { name: string; price: number }>): OptionalItem {
  return products.find(p => hasIdentifier(p, id));
}
```

## See also

- [util](/util) — the `Data` type, query helpers, and update helpers that all operate on items.
- [`shelving/db`](/db) — database layer built on [`Item`](/util/item/Item).
- [`shelving/schema`](/schema) — schema validation for item shapes.
