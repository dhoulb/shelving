# BooleanStore

- Kind: class
- Import: `import { BooleanStore } from "shelving/store";`
- Extends: `Store<boolean, unknown>`

Store a boolean value.
- Any input is coerced to a boolean via `!!input`, so truthy/falsy values are accepted.
- Defaults to `false`.

A `Store` for a boolean value. `BooleanStore` defaults to `false`, coerces any assigned value to a boolean, and adds a `.toggle()` helper.

## Usage

```ts
import { BooleanStore } from "shelving/store";

const open = new BooleanStore(); // defaults to false

open.toggle();        // true
open.value = 0;       // false — assigned values are coerced to boolean
console.log(open.value); // false
```


## Signatures

```ts
new BooleanStore(value: boolean = false)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `boolean` | Defaults to `false`. |

## Returns

| Type | Description |
| --- | --- |
| `BooleanStore` |  |

## Methods

- [BooleanStore.toggle()](BooleanStore/toggle.md): Toggle the current boolean value.
