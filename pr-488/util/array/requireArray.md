# requireArray()

- Kind: function
- Import: `import { requireArray } from "shelving/util/array";`

Convert a possible array to an array (optionally with specified min/max length), or throw `RequiredError` if conversion fails.

## Signatures

```ts
requireArray(arr: MutableArray<T>, min: 1, max: 1, caller?: AnyCaller): [T]
requireArray(arr: MutableArray<T>, min: 2, max: 2, caller?: AnyCaller): [T, T]
requireArray(arr: MutableArray<T>, min: 3, max: 3, caller?: AnyCaller): [T, T, T]
requireArray(arr: MutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): [T, ...T[]]
requireArray(arr: MutableArray<T>, min: 2, max?: number, caller?: AnyCaller): [T, T, ...T[]]
requireArray(arr: MutableArray<T>, min: 3, max?: number, caller?: AnyCaller): [T, T, T, ...T[]]
requireArray(arr: MutableArray<T>, min?: number, max?: number, caller?: AnyCaller): MutableArray<T>
requireArray(arr: ImmutableArray<T>, min: 1, max: 1, caller?: AnyCaller): readonly [T]
requireArray(arr: ImmutableArray<T>, min: 2, max: 2, caller?: AnyCaller): readonly [T, T]
requireArray(arr: ImmutableArray<T>, min: 3, max: 3, caller?: AnyCaller): readonly [T, T, T]
requireArray(arr: ImmutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): readonly [T, ...T[]]
requireArray(arr: ImmutableArray<T>, min: 2, max?: number, caller?: AnyCaller): readonly [T, T, ...T[]]
requireArray(arr: ImmutableArray<T>, min: 3, max?: number, caller?: AnyCaller): readonly [T, T, T, ...T[]]
requireArray(list: PossibleArray<T>, min?: number, max?: number, caller?: AnyCaller): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `MutableArray<T>` |  |
| `min` | `1` | Minimum number of items the array must contain (defaults to `0`). |
| `max` | `1` | Maximum number of items the array may contain (defaults to `Infinity`). |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireArray` itself). Optional. |
| `min` | `2` |  |
| `max` | `2` |  |
| `caller` | `AnyCaller` | Optional. |
| `min` | `3` |  |
| `max` | `3` |  |
| `min` | `1` | Optional. |
| `max` | `number` | Optional. |
| `min` | `number` | Optional. |
| `arr` | `ImmutableArray<T>` |  |
| `min` | `1` |  |
| `max` | `1` |  |
| `list` | `PossibleArray<T>` |  |

## Returns

| Type | Description |
| --- | --- |
| `[T]` | An array of the items within the length bounds. |
| `[T, T]` |  |
| `[T, T, T]` |  |
| `[T, ...T[]]` |  |
| `[T, T, ...T[]]` |  |
| `[T, T, T, ...T[]]` |  |
| `MutableArray<T>` |  |
| `readonly [T]` |  |
| `readonly [T, T]` |  |
| `readonly [T, T, T]` |  |
| `readonly [T, ...T[]]` |  |
| `readonly [T, T, ...T[]]` |  |
| `readonly [T, T, T, ...T[]]` |  |
| `ImmutableArray<T>` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `list` cannot be converted to an array within the length bounds. |
