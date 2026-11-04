# TREE_MARKUP_RULES

- Kind: constant
- Import: `import { TREE_MARKUP_RULES } from "shelving/ui";`

Default markup rules with the inline-code rule swapped for `TREE_CODE_RULE` — every backtick span auto-links to its documented token.
- Identical to `MARKUP_RULES` with only `CODE_RULE` replaced, so any future change to the default rule set flows through.

## Signatures

```ts
TREE_MARKUP_RULES: MarkupRules
```
