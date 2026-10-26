# requireLast()

- Kind: function
- Import: `import { requireLast } from "shelving/util/array";`

Get the last item from an array or iterable.

## Signatures

```ts
requireLast(items: PossibleArray<T>, caller: AnyCaller = requireLast): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to read from. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireLast` itself). Defaults to `requireLast`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The last item. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `items` is empty. |
