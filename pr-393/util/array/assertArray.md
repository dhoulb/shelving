# assertArray()

- Kind: function
- Import: `import { assertArray } from "shelving/util/array";`

Assert that an unknown value is an array (optionally with specified min/max length).

## Signatures

```ts
assertArray(arr: MutableArray<T>, min: 1, max: 1, caller?: AnyCaller): asserts arr is [T]
assertArray(arr: MutableArray<T>, min: 2, max: 2, caller?: AnyCaller): asserts arr is [T, T]
assertArray(arr: MutableArray<T>, min: 3, max: 3, caller?: AnyCaller): asserts arr is [T, T, T]
assertArray(arr: MutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): asserts arr is [T, ...T[]]
assertArray(arr: MutableArray<T>, min: 2, max?: number, caller?: AnyCaller): asserts arr is [T, T, ...T[]]
assertArray(arr: MutableArray<T>, min: 3, max?: number, caller?: AnyCaller): asserts arr is [T, T, T, ...T[]]
assertArray(arr: MutableArray<T>, min: number, max?: number, caller?: AnyCaller): asserts arr is MutableArray<T>
assertArray(arr: ImmutableArray<T>, min: 1, max: 1, caller?: AnyCaller): asserts arr is readonly [T]
assertArray(arr: ImmutableArray<T>, min: 2, max: 2, caller?: AnyCaller): asserts arr is readonly [T, T]
assertArray(arr: ImmutableArray<T>, min: 3, max: 3, caller?: AnyCaller): asserts arr is readonly [T, T, T]
assertArray(arr: ImmutableArray<T>, min?: 1, max?: number, caller?: AnyCaller): asserts arr is readonly [T, ...T[]]
assertArray(arr: ImmutableArray<T>, min: 2, max?: number, caller?: AnyCaller): asserts arr is readonly [T, T, ...T[]]
assertArray(arr: ImmutableArray<T>, min: 3, max?: number, caller?: AnyCaller): asserts arr is readonly [T, T, T, ...T[]]
assertArray(arr: ImmutableArray<T>, min?: number, max?: number, caller?: AnyCaller): asserts arr is ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `MutableArray<T>` |  |
| `min` | `1` | Minimum number of items the array must contain (defaults to `0`). |
| `max` | `1` | Maximum number of items the array may contain (defaults to `Infinity`). |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertArray` itself). Optional. |
| `min` | `2` |  |
| `max` | `2` |  |
| `caller` | `AnyCaller` | Optional. |
| `min` | `3` |  |
| `max` | `3` |  |
| `min` | `1` | Optional. |
| `max` | `number` | Optional. |
| `min` | `number` |  |
| `arr` | `ImmutableArray<T>` |  |
| `min` | `1` |  |
| `max` | `1` |  |
| `min` | `number` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `asserts arr is [T]` |  |
| `asserts arr is [T, T]` |  |
| `asserts arr is [T, T, T]` |  |
| `asserts arr is [T, ...T[]]` |  |
| `asserts arr is [T, T, ...T[]]` |  |
| `asserts arr is [T, T, T, ...T[]]` |  |
| `asserts arr is MutableArray<T>` |  |
| `asserts arr is readonly [T]` |  |
| `asserts arr is readonly [T, T]` |  |
| `asserts arr is readonly [T, T, T]` |  |
| `asserts arr is readonly [T, ...T[]]` |  |
| `asserts arr is readonly [T, T, ...T[]]` |  |
| `asserts arr is readonly [T, T, T, ...T[]]` |  |
| `asserts arr is ImmutableArray<T>` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `value` is not an array within the length bounds. |
