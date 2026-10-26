# MemoryTable

- Kind: class
- Import: `import { MemoryTable } from "shelving/db";`
- Implements: `AsyncDisposable`

In-memory table holding the items of a single collection for a `MemoryDBProvider`.

- Keys items by id in a `Map`, preserving the exact object instance passed in.
- An internal `DeferredSequence` resolves on every change, powering the live `*Sequence` subscriptions.

## Signatures

```ts
new MemoryTable<I, T>(collection: Collection<string, I, T>, items?: Iterable<readonly [I, Item<I, T>]>)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` |  |
| `items` | `Iterable<readonly [I, Item<I, T>]>` | Optional initial `[id, item]` entries to seed the table with. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `MemoryTable<I, T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `collection` | `Collection<string, I, T>` | Collection this table stores the items of. Read only. |

## Examples

```ts
const table = provider.getTable(users);
 table.setItem(123, { name: "Dave" });
```

## Methods

- [MemoryTable.getItem()](MemoryTable/getItem.md): Get an item by its id, or undefined if it doesn't exist.
- [MemoryTable.getItemSequence()](MemoryTable/getItemSequence.md): Subscribe to all changes for this item key.
- [MemoryTable.getItemTime()](MemoryTable/getItemTime.md): Get the time an item was last set or deleted in this table, or undefined if it never was.
- [MemoryTable.generateUniqueID()](MemoryTable/generateUniqueID.md): Generate a unique id for a new item in this table.
- [MemoryTable.addItem()](MemoryTable/addItem.md): Add a new item with a freshly generated unique id.
- [MemoryTable.setItem()](MemoryTable/setItem.md): Set (insert or overwrite) an item by its id.
- [MemoryTable.setItemSequence()](MemoryTable/setItemSequence.md): Mirror an async sequence of item values into this table, passing each value through.
- [MemoryTable.updateItem()](MemoryTable/updateItem.md): Apply partial updates to an existing item by its id.
- [MemoryTable.deleteItem()](MemoryTable/deleteItem.md): Delete an item by its id.
- [MemoryTable.countQuery()](MemoryTable/countQuery.md): Count the items in this table matching an optional query.
- [MemoryTable.getQuery()](MemoryTable/getQuery.md): Get the items in this table matching an optional query.
- [MemoryTable.getQuerySequence()](MemoryTable/getQuerySequence.md): Subscribe to the live result of a query.
- [MemoryTable.getQueryTime()](MemoryTable/getQueryTime.md): Get the time a query was last marked as loaded in this table, or undefined if it never was.
- [MemoryTable.setQueryTime()](MemoryTable/setQueryTime.md): Mark a query as loaded, i.e. the items in this table are the complete answer to the query.
- [MemoryTable.setQuery()](MemoryTable/setQuery.md): Set (overwrite) the data for every item matching a query.
- [MemoryTable.updateQuery()](MemoryTable/updateQuery.md): Apply partial updates to every item matching a query.
- [MemoryTable.deleteQuery()](MemoryTable/deleteQuery.md)
- [MemoryTable.setItems()](MemoryTable/setItems.md)
- [MemoryTable.setItemsSequence()](MemoryTable/setItemsSequence.md)
- [MemoryTable.clone()](MemoryTable/clone.md): Clone this table into a new plain MemoryTable containing the same items.
