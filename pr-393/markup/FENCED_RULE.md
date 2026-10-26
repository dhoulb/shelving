# FENCED_RULE

- Kind: constant
- Import: `import { FENCED_RULE } from "shelving/markup";`

Fenced code blocks
- Same as Markdown syntax.
- Start when we reach an opening fence on a new line.
- Stop when we reach a matching closing fence on a new line, or the end of the string.
- Closing fence must be exactly the same as the opening fence, and can be made of three or more backticks, or three or more `~~~` tildes.
- If there's no closing fence the code block will run to the end of the current string.
- Markdown-style four-space indent syntax is not supported (only fenced code since it's less confusing and more common).

## Examples

```ts
new MarkupParser({ rules: [FENCED_RULE] }).parse("```\ncode block\n```")
```
