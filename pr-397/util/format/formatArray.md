# formatArray()

- Kind: function
- Import: `import { formatArray } from "shelving/util/format";`

Format an unknown array as a string.

## Signatures

```ts
formatArray(arr: ImmutableArray<unknown>, options?: ArrayFormatOptions, caller: AnyCaller = formatArray): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `arr` | `ImmutableArray<unknown>` | Array of values to format. |
| `options` | `ArrayFormatOptions` | Formatting options passed through to `Intl.ListFormat`. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatArray` itself). Defaults to `formatArray`. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted list string with each item converted via `formatValue()`. |
