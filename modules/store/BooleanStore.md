# BooleanStore

A [`Store`](/store/Store) for a boolean value. `BooleanStore` defaults to `false`, coerces any assigned value to a boolean, and adds a `.toggle()` helper.

## Usage

```ts
import { BooleanStore } from "shelving/store";

const open = new BooleanStore(); // defaults to false

open.toggle();        // true
open.value = 0;       // false — assigned values are coerced to boolean
console.log(open.value); // false
```

## See also

- [`Store`](/store/Store) — the base class.
- [`shelving/store`](/store) — overview of all store classes.
