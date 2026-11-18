# getLast()

- Kind: function
- Import: `import { getLast } from "shelving/util/array";`

Get the last item from an array or iterable, or `undefined` if it didn't exist.

## Signatures

```ts
getLast(items: PossibleArray<T>): T | undefined
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to read from. |

## Returns

| Type | Description |
| --- | --- |
| `T \| undefined` | The last item, or `undefined` if `items` is empty. |
