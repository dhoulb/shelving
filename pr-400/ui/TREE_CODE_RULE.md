# TREE_CODE_RULE

- Kind: constant
- Import: `import { TREE_CODE_RULE } from "shelving/ui";`

Markup rule that renders an inline code span as a tree-resolved `<TreeLink>` instead of a plain `<code>`.
- Reuses `CODE_RULE`'s regexp, contexts, and priority — only the renderer changes — so it masks and matches identically to the default inline-code rule.
- The span's text becomes the link `name`: a hit links to the token's canonical page, a miss falls back to a plain code token (see `TreeLink`), so unknown spans (`bun run fix`, `string`, …) stay code.

## Signatures

```ts
TREE_CODE_RULE: MarkupRule
```
