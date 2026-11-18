# MarkupExtractor

- Kind: class
- Import: `import { MarkupExtractor } from "shelving/extract";`
- Extends: `FileExtractor`

File extractor for Markdown files.
- Stores the markdown text as `content`; rendering happens at output time via `<Markup>`.
- Sets `title` from the first `# h1` heading if one is present — otherwise leaves it undefined
  (a confident title only).
- When a `title` is found, strips the leading `# h1` from `content` so renderers (which show
  `title` separately) don't display the heading twice.
- Sets `description` to the first prose paragraph as a plain-text summary (used for card listings and `<meta>`).

## Signatures

```ts
new MarkupExtractor()
```

## Returns

| Type | Description |
| --- | --- |
| `MarkupExtractor` |  |

## Examples

```ts
new MarkupExtractor().extract(Bun.file("/abs/path/README.md"))
```
