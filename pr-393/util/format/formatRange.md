# formatRange()

- Kind: function
- Import: `import { formatRange } from "shelving/util/format";`

Format a number range (based on the user's browser language settings).

## Signatures

```ts
formatRange(from: number, to: number, options?: NumberFormatOptions): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `from` | `number` | Number at the start of the range. |
| `to` | `number` | Number at the end of the range. |
| `options` | `NumberFormatOptions` | Formatting options passed through to `Intl.NumberFormat`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted number range string. |
