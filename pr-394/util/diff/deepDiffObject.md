# deepDiffObject()

- Kind: function
- Import: `import { deepDiffObject } from "shelving/util/diff";`

Diff two objects to produce the transformation needed to transform `left` into `right`
- Only works on enumerable own keys (as returned by `Object.keys()`).
- Includes a constructor check — if `left` and `right` have different constructors they will not be merged and `right` will be returned (ensures arrays aren't compared with objects).
- Properties that exist in `left` but not `right` (i.e. have been deleted) are represented with `undefined`

## Signatures

```ts
deepDiffObject(left: ImmutableObject, right: R): R | DeepPartial<R> | typeof SAME
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `ImmutableObject` | The old object. |
| `right` | `R` | The new/target object. |

## Returns

| Type | Description |
| --- | --- |
| `R \| DeepPartial<R> \| typeof SAME` | Object containing the missing/updated properties that `left` needs to become `right`. - If the two values are deeply equal the `SAME` constant is returned. - If `left` isn't an object then the result can't be diffed so entire `right` is returned. - Diff object has a `null` prototype, so an untrusted `"__proto__"` key in `right` becomes an inert own property instead of injecting a prototype. |
