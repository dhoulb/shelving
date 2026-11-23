# createWordRegExp()

- Kind: function
- Import: `import { createWordRegExp } from "shelving/markup";`

Create a `RegExp` that matches a word of content, wrapped between word-start and word-end boundaries.

*Factory for `RegExp`.*

## Signatures

```ts
createWordRegExp(pattern: NamedRegExp<T>, start?: PossibleRegExp, end?: PossibleRegExp): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
createWordRegExp(pattern: PossibleRegExp, start?: PossibleRegExp, end?: PossibleRegExp): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `pattern` | `NamedRegExp<T>` | The content pattern to match between the boundaries (a `NamedRegExp` to type the captured data). |
| `start` | `PossibleRegExp` | The leading boundary pattern (defaults to `WORD_START_REGEXP`). Optional. |
| `end` | `PossibleRegExp` | The trailing boundary pattern (defaults to `WORD_END_REGEXP`). Optional. |
| `pattern` | `PossibleRegExp` |  |
| `start` | `PossibleRegExp` | Optional. |
| `end` | `PossibleRegExp` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `T extends NamedRegExpData ? NamedRegExp<T> : RegExp` | A `RegExp` (a `NamedRegExp<T>` when the content pattern names its capture groups). |
| `T extends NamedRegExpData ? NamedRegExp<T> : RegExp` |  |

## Examples

```ts
createWordRegExp("(?<char>[*_])+")
```
