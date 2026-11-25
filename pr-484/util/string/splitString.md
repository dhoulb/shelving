# splitString()

- Kind: function
- Import: `import { splitString } from "shelving/util/string";`

Divide a string into parts based on a separator.
- Like `String.prototype.split()` but with more useful arguments.
- Excess segments in `String.prototype.split()` is counterintuitive because further parts are thrown away.
- Excess segments in `splitString()` are concatenated onto the last segment (set `max` to `null` if you want infinite segments).

## Signatures

```ts
splitString(str: string, separator: string, min: 1, max: 1, caller?: AnyCaller): readonly [string]
splitString(str: string, separator: string, min: 2, max: 2, caller?: AnyCaller): readonly [string, string]
splitString(str: string, separator: string, min: 3, max: 3, caller?: AnyCaller): readonly [string, string, string]
splitString(str: string, separator: string, min: 4, max: 4, caller?: AnyCaller): readonly [string, string, string, string]
splitString(str: string, separator: string, min?: 1, max?: number, caller?: AnyCaller): readonly [string, ...string[]]
splitString(str: string, separator: string, min: 2, max?: number, caller?: AnyCaller): readonly [string, string, ...string[]]
splitString(str: string, separator: string, min: 3, max?: number, caller?: AnyCaller): readonly [string, string, string, ...string[]]
splitString(str: string, separator: string, min: 4, max?: number, caller?: AnyCaller): readonly [string, string, string, string, ...string[]]
splitString(str: string, separator: string, min?: number, max?: number, caller?: AnyCaller): ImmutableArray<string>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `str` | `string` | The string to divide. |
| `separator` | `string` | The separator to divide `str` on. |
| `min` | `1` | The minimum number of segments required (defaults to `1`). |
| `max` | `1` | The maximum number of segments (excess segments are concatenated onto the last; defaults to `Infinity`). |
| `caller` | `AnyCaller` | Function to attribute a thrown error to (defaults to `splitString` itself). Optional. |
| `str` | `string` |  |
| `separator` | `string` |  |
| `min` | `2` |  |
| `max` | `2` |  |
| `caller` | `AnyCaller` | Optional. |
| `min` | `3` |  |
| `max` | `3` |  |
| `min` | `4` |  |
| `max` | `4` |  |
| `min` | `1` | Optional. |
| `max` | `number` | Optional. |
| `min` | `number` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `readonly [string]` | Array of the divided segments. |
| `readonly [string, string]` |  |
| `readonly [string, string, string]` |  |
| `readonly [string, string, string, string]` |  |
| `readonly [string, ...string[]]` |  |
| `readonly [string, string, ...string[]]` |  |
| `readonly [string, string, string, ...string[]]` |  |
| `readonly [string, string, string, string, ...string[]]` |  |
| `ImmutableArray<string>` |  |

## Throws

| Type | Description |
| --- | --- |
| `ValueError` | If `min` isn't met, or if any of the segments are empty. |
