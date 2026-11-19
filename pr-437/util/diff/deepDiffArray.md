# deepDiffArray()

- Kind: function
- Import: `import { deepDiffArray } from "shelving/util/diff";`

Diff two arrays to produce the transformation needed to transform `left` into `right`
DH: Currently arrays don't diff at an item level, they return the entire new array if not deeply equal.

## Signatures

```ts
deepDiffArray(left: ImmutableArray, right: R): R | typeof SAME
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `ImmutableArray` | The old array. |
| `right` | `R` | The new/target array. |

## Returns

| Type | Description |
| --- | --- |
| `R \| typeof SAME` | The `right` array if it is different to `left`, or the exact `SAME` constant otherwise. - If the two values are deeply equal the `SAME` constant is returned. |
