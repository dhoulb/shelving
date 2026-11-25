# deepDiff()

- Kind: function
- Import: `import { deepDiff } from "shelving/util/diff";`

Deeply diff two unknown values to produce the transformation needed to transform `left` into `right`, or the `SAME` constant if they are deeply equal.

## Signatures

```ts
deepDiff(left: unknown, right: R): R | DeepPartial<R> | typeof SAME
deepDiff(left: unknown, right: R): R | typeof SAME
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `unknown` | The old value. |
| `right` | `R` | The new/target value. |
| `left` | `unknown` |  |
| `right` | `R` |  |

## Returns

| Type | Description |
| --- | --- |
| `R \| DeepPartial<R> \| typeof SAME` | The transformation needed to transform `left` into `right` - If the two values are deeply equal the `SAME` constant is returned. - Unequal scalar values can't be diffed, so `right` is always returned. - If `right` is an array, returns whatever `deepDiffArray()` returns. - If `right` is an object, returns whatever `deepDiffObject()` returns. |
| `R \| typeof SAME` |  |
