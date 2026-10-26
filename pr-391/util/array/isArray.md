# isArray()

- Kind: function
- Import: `import { isArray } from "shelving/util/array";`

Is an unknown value an array (optionally with specified min/max length)?

## Signatures

```ts
isArray(arr: MutableArray<T>, min: 1, max: 1): arr is [T]
isArray(arr: MutableArray<T>, min: 2, max: 2): arr is [T, T]
isArray(arr: MutableArray<T>, min: 3, max: 3): arr is [T, T, T]
isArray(arr: MutableArray<T>, min?: 1, max?: number): arr is [T, ...T[]]
isArray(arr: MutableArray<T>, min: 2, max?: number): arr is [T, T, ...T[]]
isArray(arr: MutableArray<T>, min: 3, max?: number): arr is [T, T, T, ...T[]]
isArray(arr: MutableArray<T>, min?: number, max?: number): arr is MutableArray<T>
isArray(arr: ImmutableArray<T>, min: 1, max: 1): arr is readonly [T]
isArray(arr: ImmutableArray<T>, min: 2, max: 2): arr is readonly [T, T]
isArray(arr: ImmutableArray<T>, min: 3, max: 3): arr is readonly [T, T, T]
isArray(arr: ImmutableArray<T>, min?: 1, max?: number): arr is readonly [T, ...T[]]
isArray(arr: ImmutableArray<T>, min: 2, max?: number): arr is readonly [T, T, ...T[]]
isArray(arr: ImmutableArray<T>, min: 3, max?: number): arr is readonly [T, T, T, ...T[]]
isArray(value: unknown, min?: number, max?: number): value is ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `MutableArray<T>` |  |
| `min` | `1` | Minimum number of items the array must contain (defaults to `0`). |
| `max` | `1` | Maximum number of items the array may contain (defaults to `Infinity`). |
| `min` | `2` |  |
| `max` | `2` |  |
| `min` | `3` |  |
| `max` | `3` |  |
| `min` | `1` | Optional. |
| `max` | `number` | Optional. |
| `min` | `number` | Optional. |
| `arr` | `ImmutableArray<T>` |  |
| `min` | `1` |  |
| `max` | `1` |  |
| `value` | `unknown` |  |

## Returns

| Type | Description |
| --- | --- |
| `arr is [T]` | `true` if `value` is an array within the length bounds, narrowing its type. |
| `arr is [T, T]` |  |
| `arr is [T, T, T]` |  |
| `arr is [T, ...T[]]` |  |
| `arr is [T, T, ...T[]]` |  |
| `arr is [T, T, T, ...T[]]` |  |
| `arr is MutableArray<T>` |  |
| `arr is readonly [T]` |  |
| `arr is readonly [T, T]` |  |
| `arr is readonly [T, T, T]` |  |
| `arr is readonly [T, ...T[]]` |  |
| `arr is readonly [T, T, ...T[]]` |  |
| `arr is readonly [T, T, T, ...T[]]` |  |
| `value is ImmutableArray<T>` |  |
