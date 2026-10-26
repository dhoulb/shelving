# MarkupParser.nested()

- Kind: method
- Member of: `MarkupParser`

Return a copy of this parser with `depth` incremented by one, sharing all other options.
- Self-recursive rules (e.g. blockquotes) parse their nested content through `nested()` so `depth` tracks how
  deep the recursion has gone, letting them stop before the call stack overflows.

## Signatures

```ts
nested(): MarkupParser
```
