# DictionaryStore

A `Store` for a string-keyed object (a dictionary). `DictionaryStore<T>` defaults to an empty object and adds entry-level helpers — each mutation produces a new object so consumers see a genuine change.

## Usage

```ts
import { DictionaryStore } from "shelving/store";

const prices = new DictionaryStore<number>({ apple: 1 });

prices.set("banana", 2);          // { apple: 1, banana: 2 }
prices.update({ apple: 3 });      // { apple: 3, banana: 2 }
prices.delete("banana");          // { apple: 3 }

console.log(prices.get("apple")); // 3
console.log(prices.count);        // 1

for (const [key, value] of prices) console.log(key, value); // iterable over entries
```
