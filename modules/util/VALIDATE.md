# Validation helpers

These helpers define the `Validator<T>` interface and utility functions for applying validators to single values, arrays, dictionaries, and full data objects. They exist to give all Shelving validators a common contract and to collect field-level errors before throwing — rather than stopping at the first failure.

**Things to know:**

- A `Validator<T>` is any object with a `validate(unsafeValue: unknown): T` method. `validate()` should throw a **string** (not an `Error`) to report a user-facing message; throwing an actual `Error` is reserved for programmer mistakes.
- `getValid()` returns `undefined` on a string-throw but re-throws real `Error` instances — useful when you want a fallback rather than a crash.
- `validateArray`, `validateDictionary`, and `validateData` all **collect all errors** across every item/entry/prop before throwing, so you get a full list of problems at once.
- `validateData()` strips excess keys not covered by the `validators` map and omits `undefined` values from the output. It returns the same reference when nothing changed.
- `ValidatorType<X>` and `ValidatorsType<T>` are type utilities for extracting the validated type from a `Validator` or a `Validators` map.

## Usage

### Single-value validation

```ts
import { getValid, requireValid } from "shelving/util";

const positiveNumber = {
  validate(v: unknown) {
    if (typeof v !== "number" || v <= 0) throw "Must be a positive number";
    return v;
  },
};

getValid(-1, positiveNumber);     // undefined
getValid(5, positiveNumber);      // 5
requireValid(-1, positiveNumber); // throws RequiredError("Must be a positive number")
```

### Validating arrays and dictionaries

```ts
import { validateArray, validateDictionary } from "shelving/util";

validateArray([1, 2, -1, 3], positiveNumber);
// throws "0: Must be a positive number" (index-prefixed messages)

validateDictionary({ a: 1, b: -1 }, positiveNumber);
// throws "b: Must be a positive number" (key-prefixed messages)
```

### Validating a data object

```ts
import { validateData } from "shelving/util";

const validators = {
  name: { validate: (v: unknown) => { if (typeof v !== "string") throw "Must be string"; return v; } },
  age:  positiveNumber,
};

validateData({ name: "Alice", age: 30, extra: true }, validators);
// { name: "Alice", age: 30 }  (excess key "extra" is stripped)
```

### Type utilities

```ts
import type { ValidatorType, ValidatorsType } from "shelving/util";

type MyNumber = ValidatorType<typeof positiveNumber>; // number
type MyShape = ValidatorsType<typeof validators>;     // { name: string; age: number }
```

## See also

- [schema](/schema) — Higher-level schema system built on top of `Validator<T>`.
- [util](/util) — naming conventions and the full helper overview.
