# getFirst()

- Kind: function
- Import: `import { getFirst } from "shelving/util/array";`

Get the first item from an array or iterable, or `undefined` if it didn't exist.

## Signatures

```ts
getFirst(items: PossibleArray<T>): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to read from. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The first item, or `undefined` if `items` is empty. |
