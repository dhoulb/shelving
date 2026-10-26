# requirePrev()

- Kind: function
- Import: `import { requirePrev } from "shelving/util/array";`

Get the previous item from an array or iterable.

## Signatures

```ts
requirePrev(items: PossibleArray<T>, item: T, caller: AnyCaller = requirePrev): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to search. |
| `item` | `T` | The item to find the predecessor of. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requirePrev` itself). Defaults to `requirePrev`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The item preceding `item`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `item` is missing or has no predecessor. |
