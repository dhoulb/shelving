# getPrev()

- Kind: function
- Import: `import { getPrev } from "shelving/util/array";`

Get the previous item in an array or iterable.

## Signatures

```ts
getPrev(items: PossibleArray<T>, value: T): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to search. |
| `value` | `T` | The item to find the predecessor of. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The item preceding `value`, or `undefined` if `value` is missing or first. |
