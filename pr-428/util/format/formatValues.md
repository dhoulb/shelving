# formatValues()

- Kind: function
- Import: `import { formatValues } from "shelving/util/format";`

Format a sequence of values.

## Signatures

```ts
formatValues(values: Iterable<unknown>, options?: FormatOptions, caller: AnyCaller = formatValues): Iterable<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `values` | `Iterable<unknown>` | Iterable of unknown values to format. |
| `options` | `FormatOptions` | Formatting options passed through to `formatValue()` for each item. Optional. |
| `.locale` | `Intl.Locale \| undefined` | Override the locale for formatting (defaults to detected locale). Read only. Optional. |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `formatValues` itself). Defaults to `formatValues`. |

## Returns

| Type | Description |
| --- | --- |
| `Iterable<string>` | Iterable yielding the user-facing string for each value. |

## Examples

```ts
[...formatValues([1234, true])] // ["1,234", "Yes"]
```
