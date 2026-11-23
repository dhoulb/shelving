# limitArray()

- Kind: function
- Import: `import { limitArray } from "shelving/util/array";`

Apply a limit to an array.

## Signatures

```ts
limitArray(list: PossibleArray<T>, limit: number): ImmutableArray<T>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `list` | `PossibleArray<T>` | The array or iterable to limit. |
| `limit` | `number` | The maximum number of items to keep. |

## Returns

| Type | Description |
| --- | --- |
| `ImmutableArray<T>` | An array of at most `limit` items, or the same array if it was already within the limit. |

## Throws

| Type | Description |
| --- | --- |
| `RequiredError` | If `list` cannot be converted to an array. |
