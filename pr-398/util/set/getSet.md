# getSet()

- Kind: function
- Import: `import { getSet } from "shelving/util/set";`

Convert a possible set to a `Set`.
- Returns the input unchanged when it is already a `Set`; otherwise constructs a new `Set` from the iterable.

## Signatures

```ts
getSet(value: PossibleSet<T>): ImmutableSet
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `value` | `PossibleSet<T>` | A `Set` or any iterable of items. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableSet` | A `Set` containing the items of `value`. |
