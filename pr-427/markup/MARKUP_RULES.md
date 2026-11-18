# MARKUP_RULES

- Kind: constant
- Import: `import { MARKUP_RULES } from "shelving/markup";`

Default markup rules — the combined block and inline rules `MarkupParser` uses when none are supplied.

These rules define a syntax similar to Markdown but with improvements:
1. Syntax is more intuitive (e.g. `*strong*` always uses `*` asterisk and `_em_` always uses `_` underscore, and URLs are always autolinked).
2. More compatible with textboxes that wrap lines by default (e.g. single `\n` linebreaks don't need the trailing double space to, they're always treated as `<br />`).
3. Don't support fussy fragile syntax that lets users make mistakes (e.g. literal HTML tags or `&amp;` character entities).

## Signatures

```ts
MARKUP_RULES: MarkupRules
```

## Examples

```ts
new MarkupParser({ rules: MARKUP_RULES }).parse("This is a *bold* string.")
```
