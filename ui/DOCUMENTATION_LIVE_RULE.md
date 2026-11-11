# DOCUMENTATION_LIVE_RULE

- Kind: constant
- Import: `import { DOCUMENTATION_LIVE_RULE } from "shelving/ui";`

Markup rule that renders a fenced code block with a `live` flag as a `<DocumentationLive>` example, e.g. ` ```tsx live "Card with a link" `.
- The `live` flag must come before any quoted title (see `parseFencedInfo()` for the info string format).
- Has the same priority as `FENCED_RULE`, so a `live` block inside a longer fence stays code. List it before `FENCED_RULE`, so it takes the `live` blocks and leaves every other block to `FENCED_RULE`.

@see https://shelving.cc/ui/DOCUMENTATION_LIVE_RULE

## Signatures

```ts
DOCUMENTATION_LIVE_RULE: MarkupRule
```
