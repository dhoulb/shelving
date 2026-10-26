# ArrayStore

- Kind: class
- Import: `import { ArrayStore } from "shelving/store";`
- Extends: `BusyStore<ImmutableArray<T>, PossibleArray<T>>`
- Implements: `Iterable<T>`

Store an immutable array of items, with helpers to read and mutate its contents.
- Accepts any `PossibleArray<T>` as input and normalises it to an `ImmutableArray<T>`.
- Mutations (`add()`, `delete()`, `toggle()`) replace the stored array with an immutable updated copy.
- Iterable, so you can `for (const item of store)`.

A `Store` for an array value. `ArrayStore<T>` defaults to an empty array, accepts any iterable as input, and adds immutable array helpers — every mutation produces a new array so consumers see a genuine change.

## Usage

```ts
import { ArrayStore } from "shelving/store";

const tags = new ArrayStore<string>(["a", "b"]);

tags.add("c");          // ["a", "b", "c"]
tags.delete("a");       // ["b", "c"]
tags.toggle("b");       // ["c"] — removes if present, adds if not

console.log(tags.first);   // "c"   (throws if empty)
console.log(tags.count);   // 1
console.log(tags.exists);  // true

for (const tag of tags) console.log(tag); // ArrayStore is iterable
```

Use `.optionalFirst` / `.optionalLast` instead of `.first` / `.last` to get `undefined` rather than a thrown `RequiredError` when the array is empty.


## Signatures

```ts
new ArrayStore<T>(value: PossibleArray<T> = [])
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleArray<T>` | Defaults to `[]`. |

## Returns

| Type | Description |
| --- | --- |
| `ArrayStore<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `optionalFirst` | `T \| undefined` | Get the first item in this store, or `undefined` if it has no items. Read only. |
| `optionalLast` | `T \| undefined` | Get the last item in this store, or `undefined` if it has no items. Read only. |
| `first` | `T` | Get the first item in this store, or throw `RequiredError` if it has no items. Read only. |
| `last` | `T` | Get the last item in this store, or throw `RequiredError` if it has no items. Read only. |
| `exists` | `boolean` | Whether this store has at least one item. Read only. |
| `count` | `number` | Get the number of items in the current value of this store. Read only. |

## Methods

- [ArrayStore.add()](ArrayStore/add.md): Add one or more items to this array.
- [ArrayStore.delete()](ArrayStore/delete.md): Remove one or more items from this array.
- [ArrayStore.toggle()](ArrayStore/toggle.md): Toggle one or more items in this array (add if absent, remove if present).
