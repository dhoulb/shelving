# shelving/util/array

- Kind: module
- Import: `import { … } from "shelving/util/array";`

Typed helpers for reading, validating, and immutably transforming arrays. All immutable operations return the original reference when nothing changed, which keeps React state and memoisation stable.

- `with*` / `omit*` / `toggle*` functions accept any `PossibleArray` (an array or any `Iterable`) but always return a typed `ImmutableArray`.
- `add*` / `delete*` functions mutate the array in place — use them only when you own the reference.
- `withArrayItem()` / `withArrayItems()` are set-semantics: they skip items already present rather than creating duplicates.

## Usage

### Checking and asserting

```ts
import { isArray, assertArray, requireArray } from "shelving/util";

isArray(value);           // true if Array
isArray(value, 1);        // true if Array with at least 1 item
isArray(value, 2, 5);     // true if Array with 2–5 items

assertArray(value, 1);    // throws RequiredError if empty or not an array
requireArray(iterable, 1); // converts iterable then asserts, returns ImmutableArray
```

### Reading items

```ts
import { getFirst, requireFirst, getLast, requireLast, getNext, getPrev } from "shelving/util";

getFirst([10, 20, 30]);          // 10
requireFirst([]);                // throws RequiredError
getLast([10, 20, 30]);           // 30
getNext([1, 2, 3], 2);           // 3
getPrev([1, 2, 3], 2);           // 1
```

### Immutable updates

```ts
import { withArrayItem, withArrayItems, omitArrayItem, omitArrayItems,
         toggleArrayItem, withArrayIndex, omitArrayIndex } from "shelving/util";

withArrayItem(["a", "b"], "c");          // ["a", "b", "c"]
withArrayItem(["a", "b"], "b");          // same ref — already present
omitArrayItem(["a", "b", "c"], "b");     // ["a", "c"]
toggleArrayItem(["a", "b"], "b");        // ["a"]
toggleArrayItem(["a", "b"], "c");        // ["a", "b", "c"]
withArrayIndex([10, 20, 30], 1, 99);     // [10, 99, 30]
omitArrayIndex([10, 20, 30], 1);         // [10, 30]
```

### Mutable updates (by reference)

```ts
import { addArrayItem, addArrayItems, deleteArrayItem, deleteArrayItems } from "shelving/util";

const arr = ["a", "b"];
addArrayItem(arr, "c");      // arr is now ["a", "b", "c"]; returns "c"
addArrayItem(arr, "b");      // no-op — already present
deleteArrayItem(arr, "a");   // arr is now ["b", "c"]
```

### Filtering and shaping

```ts
import { getUniqueArray, limitArray, interleaveArray,
         pickArrayItems, shuffleArray } from "shelving/util";

getUniqueArray([1, 2, 2, 3]);           // [1, 2, 3]
limitArray([1, 2, 3, 4, 5], 3);         // [1, 2, 3]
interleaveArray(["a", "b", "c"], ", "); // ["a", ", ", "b", ", ", "c"]
pickArrayItems([1, 2, 3, 4], 2, 4);     // [2, 4]
shuffleArray([1, 2, 3]);                // randomised copy
```

### Membership checks

```ts
import { isArrayItem, assertArrayItem } from "shelving/util";

isArrayItem(["x", "y"], "x");    // true
assertArrayItem(["x", "y"], "z"); // throws RequiredError
```


## Functions

- [isArray()](array/isArray.md): Is an unknown value an array (optionally with specified min/max length)?
- [assertArray()](array/assertArray.md): Assert that an unknown value is an array (optionally with specified min/max length).
- [getArray()](array/getArray.md): Convert a possible array to an array.
- [requireArray()](array/requireArray.md): Convert a possible array to an array (optionally with specified min/max length), or throw RequiredError if conversion fails.
- [isArrayItem()](array/isArrayItem.md): Is an unknown value an item in a specified array or iterable?
- [assertArrayItem()](array/assertArrayItem.md): Assert that an unknown value is an item in a specified array.
- [withArrayItems()](array/withArrayItems.md): Add multiple items to an array (immutably) and return a new array with those items (or the same array if no changes were made).
- [pickArrayItems()](array/pickArrayItems.md): Pick multiple items from an array (immutably) and return a new array with those items (or the same array if no changes were made).
- [omitArrayItems()](array/omitArrayItems.md): Remove multiple items from an array (immutably) and return a new array without those items (or the same array if no changes were made).
- [toggleArrayItems()](array/toggleArrayItems.md): Toggle an item in and out of an array (immutably) and return a new array with or without the specified items (or the same array if no changes were made).
- [shuffleArray()](array/shuffleArray.md): Return a shuffled version of an array or iterable.
- [addArrayItem()](array/addArrayItem.md): Add an item to an array (by reference) and return the item.
- [addArrayItems()](array/addArrayItems.md): Add multiple items to an array (by reference).
- [deleteArrayItems()](array/deleteArrayItems.md): Remove multiple items from an array (by reference).
- [getUniqueArray()](array/getUniqueArray.md): Return an array of the unique items in an array.
- [limitArray()](array/limitArray.md): Apply a limit to an array.
- [countArray()](array/countArray.md): Count the items in an array.
- [interleaveArray()](array/interleaveArray.md): Interleave array items with a separator.
- [withArrayIndex()](array/withArrayIndex.md): Return a new array with a new value replacing a specific index in the array (or the same array if the value was unchanged).
- [omitArrayIndex()](array/omitArrayIndex.md): Return a new array without a specific index in the array (or the same array if the value was unchanged).
- [getFirst()](array/getFirst.md): Get the first item from an array or iterable, or undefined if it didn't exist.
- [requireFirst()](array/requireFirst.md): Get the first item from an array or iterable.
- [getLast()](array/getLast.md): Get the last item from an array or iterable, or undefined if it didn't exist.
- [requireLast()](array/requireLast.md): Get the last item from an array or iterable.
- [getNext()](array/getNext.md): Get the next item in an array or iterable.
- [requireNext()](array/requireNext.md): Get the next item from an array or iterable.
- [getPrev()](array/getPrev.md): Get the previous item in an array or iterable.
- [requirePrev()](array/requirePrev.md): Get the previous item from an array or iterable.

## Types

- [MutableArray](array/MutableArray.md): Mutable array: an array that can be changed.
- [ImmutableArray](array/ImmutableArray.md): Immutable array: an array that cannot be changed.
- [ArrayItem](array/ArrayItem.md): Get the type of the items in an array.
- [PossibleArray](array/PossibleArray.md): Things that can be converted to arrays.

## Constants

- [withArrayItem](array/withArrayItem.md): Add an item to an array (immutably) and return a new array with that item (or the same array if no changes were made).
- [pickArrayItem](array/pickArrayItem.md): Pick an item from an array (immutably) and return a new array with that item (or the same array if no changes were made).
- [omitArrayItem](array/omitArrayItem.md): Remove an item from an array (immutably) and return a new array without that item (or the same array if no changes were made).
- [toggleArrayItem](array/toggleArrayItem.md): Toggle an item in and out of an array (immutably) and return a new array with or without the specified item (or the same array if no changes were made).
- [deleteArrayItem](array/deleteArrayItem.md): Remove an item from an array (by reference).
