# formatNumber()

- Kind: function
- Import: `import { formatNumber } from "shelving/util/format";`

Format a number (based on the user's browser language settings).

## Signatures

```ts
formatNumber(num: number, options?: NumberFormatOptions): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `num` | `number` | Number to format. |
| `options` | `NumberFormatOptions` | Formatting options passed through to `Intl.NumberFormat`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Locale-formatted number string. |
