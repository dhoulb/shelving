# Compare

- Kind: type
- Import: `import { Compare } from "shelving/util/sort";`

Function that can compare two values for sorting.
- Returns a negative number if `left` sorts before `right`, positive if after, or `0` if equally ranked (like `Array.prototype.sort()`).

## Signatures

```ts
(left: T, right: T, ...args: A) => number
```
