# FileExtractor.extractProps()

- Kind: method
- Member of: `FileExtractor`

Build the file element props from the extracted content.
- `name` is the basename without extension (e.g. `"array"`) — display-ready, used by menus, cards, and URL paths.
- Override to parse `text` into richer elements (content/children/description) and to set
  `title` if a confident title is available. Overrides may be async (e.g. `TypescriptExtractor` parses via the native compiler server) — `extract()` awaits the result either way.

## Signatures

```ts
extractProps(name: string, content: string): (Partial<TreeElementProps> & { name: string }) | Promise<Partial<TreeElementProps> & { name: string }>
```
