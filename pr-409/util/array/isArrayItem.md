# isArrayItem()

- Kind: function
- Import: `import { isArrayItem } from "shelving/util/array";`

Is an unknown value an item in a specified array or iterable?

## Signatures

```ts
isArrayItem(list: PossibleArray<T>, item: unknown): item is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `list` | `PossibleArray<T>` | The array or iterable to search. |
| `item` | `unknown` | The value to look for. |

## Returns

| Type | Description |
| --- | --- |
| `item is T` | `true` if `item` exists in `list`, narrowing its type. |
