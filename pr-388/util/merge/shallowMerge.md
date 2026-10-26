# shallowMerge()

- Kind: function
- Import: `import { shallowMerge } from "shelving/util/merge";`

Shallow merge two unknown values.

- Two objects: props are merged together (shallowly).
- Two arrays: unique items are merged together (shallowly).
- Any other value: right value is returned.

## Signatures

```ts
shallowMerge(left: L, right: R): L & R
shallowMerge(left: ImmutableArray<L>, right: ImmutableArray<R>): ImmutableArray<L | R>
shallowMerge(left: unknown, right: R): R
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `left` | `L` | The left value to merge into. |
| `right` | `R` | The right value to merge in. |
| `left` | `ImmutableArray<L>` |  |
| `right` | `ImmutableArray<R>` |  |
| `left` | `unknown` |  |
| `right` | `R` |  |

## Returns

| Type | Description |
| --- | --- |
| `L & R` | Merged value. - Will be `left` instance if no properties/items changed. - Will be merged instance otherwise. |
| `ImmutableArray<L \| R>` |  |
| `R` |  |
