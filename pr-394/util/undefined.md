# shelving/util/undefined

- Kind: module
- Import: `import { … } from "shelving/util/undefined";`

Small set of guards and assertions for `undefined`. Useful in filter pipelines and for writing intent-revealing code where a plain `=== undefined` check would be less clear.

## Usage

```ts
import { isUndefined, isDefined, assertDefined, requireDefined, notUndefined, getUndefined } from "shelving/util";

isUndefined(undefined); // true
isUndefined(null);      // false

isDefined(0);           // true
isDefined(undefined);   // false

// Filter undefined values from an array:
const values = [1, undefined, 3, undefined, 5];
values.filter(isDefined); // [1, 3, 5]

// notUndefined is an alias for isDefined — use whichever reads better:
values.filter(notUndefined); // [1, 3, 5]

// Assert or require a defined value (throws RequiredError if undefined):
assertDefined(someValue);
const v = requireDefined(maybeValue); // returns the value or throws
```


## Functions

- [getUndefined()](undefined/getUndefined.md): Function that always returns undefined.
- [isUndefined()](undefined/isUndefined.md): Is a value undefined?
- [isDefined()](undefined/isDefined.md): Is a value defined (i.e. not undefined)?
- [assertDefined()](undefined/assertDefined.md): Assert that a value is not undefined.
- [requireDefined()](undefined/requireDefined.md): Get a defined value, or throw if it is undefined.

## Constants

- [notUndefined](undefined/notUndefined.md): Is a value defined (i.e. not undefined)? Alias for isDefined().
