# MARKUP_PARSER

- Kind: constant
- Import: `import { MARKUP_PARSER } from "shelving/markup";`

Shared `MarkupParser` instance configured with the default markup rules and behaviour.
- Use this singleton when no custom rules, link resolution, or default context are needed.

## Examples

```ts
MARKUP_PARSER.parse("This is a *bold* string.")
```
