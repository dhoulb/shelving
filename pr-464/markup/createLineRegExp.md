# createLineRegExp()

- Kind: function
- Import: `import { createLineRegExp } from "shelving/markup";`

Create a `RegExp` that matches a single line of content, wrapped between line-start and line-end boundaries.

*Factory for `RegExp`.*

## Signatures

```ts
createLineRegExp(pattern: NamedRegExp<T>, start?: PossibleRegExp, end?: PossibleRegExp): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
createLineRegExp(pattern: PossibleRegExp, start?: PossibleRegExp, end?: PossibleRegExp): T extends NamedRegExpData ? NamedRegExp<T> : RegExp
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `pattern` | `NamedRegExp<T>` | The content pattern to match between the boundaries (a `NamedRegExp` to type the captured data). |
| `start` | `PossibleRegExp` | The leading boundary pattern (defaults to `LINE_START_REGEXP`). Optional. |
| `end` | `PossibleRegExp` | The trailing boundary pattern (defaults to `LINE_END_REGEXP`). Optional. |
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
createLineRegExp("(?<prefix>#{1,6})")
```
