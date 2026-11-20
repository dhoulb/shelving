# requireFirst()

- Kind: function
- Import: `import { requireFirst } from "shelving/util/array";`

Get the first item from an array or iterable.

## Signatures

```ts
requireFirst(items: PossibleArray<T>, caller: AnyCaller = requireFirst): T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `items` | `PossibleArray<T>` | The array or iterable to read from. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `requireFirst` itself). Defaults to `requireFirst`. |

## Returns

| Type | Description |
| --- | --- |
| `T` | The first item. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `items` is empty. |
