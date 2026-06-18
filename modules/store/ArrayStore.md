# ArrayStore

A [`Store`](/store/Store) for an array value. `ArrayStore<T>` defaults to an empty array, accepts any iterable as input, and adds immutable array helpers — every mutation produces a new array so consumers see a genuine change.

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

Use `.optionalFirst` / `.optionalLast` instead of `.first` / `.last` to get `undefined` rather than a thrown [`RequiredError`](/error/RequiredError) when the array is empty.

## See also

- [`Store`](/store/Store) — the base class.
- [`shelving/store`](/store) — overview of all store classes.
