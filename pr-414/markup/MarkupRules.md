# MarkupRules

- Kind: type
- Import: `import { MarkupRules } from "shelving/markup";`

An immutable list of `MarkupRule` instances applied by a `MarkupParser`.

## Signatures

```ts
readonly MarkupRule[]
```

## Types

- [MarkupRule](MarkupRule.md): A single markup rule: a regular expression that matches a span of input plus a renderer that turns the match into an element.
