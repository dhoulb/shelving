# deepMerge()

- Kind: function
- Import: `import { deepMerge } from "shelving/util/merge";`

Deeply merge two unknown values.

- Two objects: props are merged together (deeply).
- Two arrays: unique items are merged together (shallowly — arrays have no way to deep merge because array keys are not stable).
- Any other value: right value is returned.

## Signatures

```ts
deepMerge(left: L, right: R): L & R
deepMerge(left: ImmutableArray<L>, right: ImmutableArray<R>): ImmutableArray<L | R>
deepMerge(left: unknown, right: R): R
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
| `L & R` | Merged value. - Will be `left` instance if no properties/items changed. - Will be a new merged instance otherwise. |
| `ImmutableArray<L \| R>` |  |
| `R` |  |
