# createFencedRegExp()

- Kind: function
- Import: `import { createFencedRegExp } from "shelving/markup";`

Create the regular expression that matches a fenced code block.

## Signatures

```ts
createFencedRegExp(info: string = LINE_CONTENT_REGEXP): NamedRegExp<{ fence: string; info?: string; code: string }>
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `info` | `string` | Regular expression source that the info string after the opening fence must match. Defaults to `LINE_CONTENT_REGEXP`. |

## Returns

| Type | Description |
| --- | --- |
| `NamedRegExp<{ fence: string; info?: string; code: string }>` | A block regular expression with `fence`, `info`, and `code` named groups. |

## Examples

```ts
createFencedRegExp("tsx live") // Matches only fences that start with ```tsx live
@see https://shelving.cc/markup/createFencedRegExp
```
