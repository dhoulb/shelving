# assertArrayItem()

- Kind: function
- Import: `import { assertArrayItem } from "shelving/util/array";`

Assert that an unknown value is an item in a specified array.

## Signatures

```ts
assertArrayItem(arr: PossibleArray<T>, item: unknown, caller: AnyCaller = assertArrayItem): asserts item is T
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `PossibleArray<T>` | The array or iterable to search. |
| `item` | `unknown` | The value to look for. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `assertArrayItem` itself). Defaults to `assertArrayItem`. |

## Returns

| Type | Description |
| --- | --- |
| `asserts item is T` |  |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `item` does not exist in `arr`. |
