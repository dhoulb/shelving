# formatDuration()

- Kind: function
- Import: `import { formatDuration } from "shelving/util/duration";`

Format a duration as a string, e.g. `1 year, 2 months, 3 days` or `1y 2m 3d`

## Signatures

```ts
formatDuration(duration: DurationData, options?: DurationFormatOptions): string
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `duration` | `DurationData` | `DurationData` object to format. |
| `options` | `DurationFormatOptions` | Formatting options passed through to `Intl.DurationFormat`. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `string` | Human-readable string describing the duration. |
