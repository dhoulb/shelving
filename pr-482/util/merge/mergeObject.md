# mergeObject()

- Kind: function
- Import: `import { mergeObject } from "shelving/util/merge";`

Merge two data objects.

Properties that exist in `right` will replace or be deeply merged with properties in `left`.
- Only works on enumerable own keys (as returned by `Object.keys()`).
- Always returns a new object (or the `left` object if no changes were made).
- Resulting object is `cleaned`, i.e. properties in `left` or `right` that are `undefined` will be removed from the merged object.
- Merged object has a `null` prototype, so an untrusted `"__proto__"` key in `right` becomes an inert own property instead of injecting a prototype.

## Signatures

```ts
mergeObject(left: L, right: R, recursor?: MergeRecursor): L & R
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `L` | The left object to merge into. |
| `right` | `R` | The right object whose props replace or merge with `left`. |
| `recursor` | `MergeRecursor` | Function that merges each property of the object. - Defaults to `exactMerge()` to just swap the property for a newer one if it exists. - Use `deepMerge()` as the recursor to merge objects deeply. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `L & R` | Merged object. - Returned instances will be the same if no changes were made. - Will be `left` instance if no properties changed. - Will be a new merged object otherwise. |
