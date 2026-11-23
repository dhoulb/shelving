# IndexExtractor

- Kind: class
- Import: `import { IndexExtractor } from "shelving/extract";`
- Extends: `ThroughExtractor<I, TreeElement>`

Through extractor that absorbs each element's index child into the element itself.
- For every element with children: finds the first child whose `key` matches any `index` pattern.
- The matched child's `title`, `description`, `content`, and `children` are folded into the parent.
- The matched child is removed from the parent's children list.
- Purely name-based: it doesn't care whether an element is a directory or a file — any element with children is processed, deepest level first.

## Signatures

```ts
new IndexExtractor<I>(source: Extractor<I, TreeElement>, { index = DEFAULT_INDEX }: IndexExtractorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Extractor<I, TreeElement>` |  |
| `options` | `IndexExtractorOptions` | Defaults to `{}`. |
| `.index` | `Matchables` | Filename patterns treated as a parent's index. Matched case-insensitively against each child element's `key`. - Defaults to README and index files: `["readme.txt", "readme.md", "index.md", "index.ts", "index.tsx"]`. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `IndexExtractor<I>` |  |

## Examples

```ts
const extractor = new IndexExtractor(new DirectoryExtractor());
```
