# shelving/util/boolean

- Kind: module
- Import: `import { … } from "shelving/util/boolean";`

Type guards and assertion functions for boolean values. These follow the standard `is*` / `assert*` naming convention and pair naturally with schema validation and runtime checks.

## Usage

### Type guards

```ts
import { isBoolean, isTrue, isFalse, isTruthy, isFalsey } from "shelving/util";

isBoolean(true);   // true
isBoolean(1);      // false  — 1 is not a boolean
isTrue(true);      // true
isFalse(false);    // true
isTruthy("hello"); // true  — any truthy value
isFalsey(0);       // true  — any falsy value
```

### Assertions

```ts
import { assertBoolean, assertTrue, assertFalse, assertTruthy, assertFalsy } from "shelving/util";

assertBoolean(value);  // throws RequiredError if not a boolean
assertTrue(value);     // throws RequiredError if not exactly true
assertFalse(value);    // throws RequiredError if not exactly false
assertTruthy(value);   // throws RequiredError if falsy
assertFalsy(value);    // throws RequiredError if truthy
```


## Functions

- [isBoolean](boolean/isBoolean.md): Is an unknown value a boolean?
- [isTrue](boolean/isTrue.md): Is an unknown value exactly true?
- [isFalse](boolean/isFalse.md): Is an unknown value exactly false?
- [isTruthy](boolean/isTruthy.md): Is an unknown value truthy?
- [isFalsey](boolean/isFalsey.md): Is an unknown value falsey?
- [assertBoolean](boolean/assertBoolean.md): Assert that an unknown value is a boolean.
- [assertTrue](boolean/assertTrue.md): Assert that an unknown value is exactly true.
- [assertFalse](boolean/assertFalse.md): Assert that an unknown value is exactly false.
- [assertTruthy](boolean/assertTruthy.md): Assert that an unknown value is truthy.
- [assertFalsy](boolean/assertFalsy.md): Assert that an unknown value is falsy.
