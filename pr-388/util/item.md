# shelving/util/item

- Kind: module
- Import: `import { … } from "shelving/util/item";`

The `Item` type and its helpers. An `Item` is a `Data` object — a plain JSON-safe record — that also carries an `id` of type `string | number`. Every database collection in Shelving operates on items, so this is the fundamental unit of persisted data.

**Things to know:**

- `getItem()` returns the same reference if `data` already has that `id` — safe for use in equality checks and memoisation.
- `getIdentifiers()` is a generator; wrap it in `Array.from()` to materialise the list.

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


## Functions

- [getIdentifier](item/getIdentifier.md): Get the identifier from an item object.
- [getIdentifiers](item/getIdentifiers.md): Get the identifiers from an iterable set of item objects.
- [hasIdentifier](item/hasIdentifier.md): Does a data object have a given identifier (and is therefore an Item).
- [getItem](item/getItem.md): Merge an ID into a set of data to make an Item.

## Types

- [Identifier](item/Identifier.md): Allowed types for the "id" property (identifier) for an item.
- [Item](item/Item.md): An item object is a data object that includes an "id" identifier property that is either a string or number.
- [OptionalItem](item/OptionalItem.md): Item object, or undefined to indicate the item doesn't exist.
- [ItemSequence](item/ItemSequence.md): An async sequence of item objects.
- [OptionalItemSequence](item/OptionalItemSequence.md): An async sequence of optional item objects.
- [Items](item/Items.md): An array of item objects.
- [ItemsSequence](item/ItemsSequence.md): An async sequence of arrays of item objects.
