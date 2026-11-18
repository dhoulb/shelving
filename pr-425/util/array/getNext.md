# getNext()

- Kind: function
- Import: `import { getNext } from "shelving/util/array";`

Get the next item in an array or iterable.

## Signatures

```ts
getNext(items: PossibleArray<T>, item: T): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to search. |
| `item` | `T` | The item to find the successor of. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The item following `item`, or `undefined` if `item` is missing or last. |
