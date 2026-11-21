# LINK_RULE

- Kind: constant
- Import: `import { LINK_RULE } from "shelving/markup";`

Markdown-style link.
- Link in standard Markdown format, e.g. `[Google Maps](http://google.com/maps)`
- If no title is specified a cleaned up version of the URL will be used, e.g. `google.com/maps`
- Does not need space before/after the link.
- If link is not valid (using `new URL(url)` then unparsed text will be returned.
- For security only schemes that appear in `MarkupOptions.schemes` will match (defaults to `http:` and `https:`).

## Examples

```ts
new MarkupParser({ rules: [LINK_RULE] }).parse("[Google Maps](http://google.com/maps)")
```
