# CODE_RULE

- Kind: constant
- Import: `import { CODE_RULE } from "shelving/markup";`

Inline code.
- Text surrounded by one or more "`" backtick tilde characters.
- Unlike strong/emphasis first or last character of the element can be space, (e.g. `- abc -` will not work).
- Closing characters must exactly match opening characters.
- Works inside link text too, e.g. `` [`code`](url) ``.
- Same as Markdown syntax.

## Examples

```ts
new MarkupParser({ rules: [CODE_RULE] }).parse("Some `inline code` here")
```
