# createBlockRegExp()

- Kind: function
- Import: `import { createBlockRegExp } from "shelving/markup";`

Create a `RegExp` that matches a block of content, wrapped between block-start and block-end boundaries.

*Factory for `RegExp`.*

## Signatures

```ts
createBlockRegExp(pattern: NamedRegExp<T>, start?: PossibleRegExp, end?: PossibleRegExp): NamedRegExp<T>
createBlockRegExp(pattern: PossibleRegExp, start?: PossibleRegExp, end?: PossibleRegExp): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `pattern` | `NamedRegExp<T>` | The content pattern to match between the boundaries (a `NamedRegExp` to type the captured data). |
| `start` | `PossibleRegExp` | The leading boundary pattern (defaults to `BLOCK_START_REGEXP`). Optional. |
| `end` | `PossibleRegExp` | The trailing boundary pattern (defaults to `BLOCK_END_REGEXP`). Optional. |
| `pattern` | `PossibleRegExp` |  |
| `start` | `PossibleRegExp` | Optional. |
| `end` | `PossibleRegExp` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `NamedRegExp<T>` | A `RegExp` (a `NamedRegExp<T>` when the content pattern names its capture groups). |
| `T extends NamedRegExpData ? NamedRegExp<T> : RegExp` |  |

## Examples

```ts
createBlockRegExp("(?<quote>>[\\s\\S]*?)")
```
