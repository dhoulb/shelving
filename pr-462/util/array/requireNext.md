# requireNext()

- Kind: function
- Import: `import { requireNext } from "shelving/util/array";`

Get the next item from an array or iterable.

## Signatures

```ts
requireNext(items: PossibleArray<T>, item: T, caller: AnyCaller = requireNext): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to search. |
| `item` | `T` | The item to find the successor of. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireNext` itself). Defaults to `requireNext`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The item following `item`. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `item` is missing or has no successor. |
