# HEADING_RULE

- Kind: constant
- Import: `import { HEADING_RULE } from "shelving/markup";`

Headings are single line only (don't allow multiline).
- `#` 1-6 hashes, then one or more spaces, then the title.
- `#` must be the first character on the line.
- Markdown's underline syntax is not supported (for simplification).
- Each heading gets a `getSlug()` `id` derived from its text, so same-page `#anchor` links resolve to it (e.g. `## React integration` becomes `id="react-integration"`). An all-punctuation heading that slugs to nothing gets no `id`.

## Examples

```ts
new MarkupParser({ rules: [HEADING_RULE] }).parse("# Title")
```
