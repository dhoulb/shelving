# MergingExtractor

- Kind: class
- Import: `import { MergingExtractor } from "shelving/extract";`
- Extends: `ThroughExtractor<I, TreeElement>`

Through extractor that walks a tree of `tree-element` nodes and merges sibling tree elements whose keys match a `merges` template pair.
- Purely key-based: it doesn't care whether siblings are directories or files — any element with children is processed, at every level.
- **Token-first:** a secondary (e.g. `Card.md`) is preferentially folded into the same-named documentation token declared by a sibling file (the `Card` symbol inside `Card.tsx`), not the file element. Exported names are unique across the package, so this is unambiguous — and it lands the prose on the published symbol page, which survives the module flatten (file-element content does not).
- **File fallback:** when no same-named token exists, the secondary folds into a sibling *file* whose key matches a `merges` candidate (whole-file prose like `template.md` → `template.ts`).
- The primary (winning) element keeps its `key`, `source`, and `type`; the secondary's `title`, `description`,
  `content`, and `children` are folded in via `mergeTreeElements()`.
- A secondary with no matching token or file is left in place — pure prose files (e.g. `concepts.md` with no `concepts.ts`) stand alone.

## Signatures

```ts
new MergingExtractor<I>(source: Extractor<I, TreeElement>, { merges = DEFAULT_MERGES }: MergingExtractorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `source` | `Extractor<I, TreeElement>` |  |
| `options` | `MergingExtractorOptions` | Defaults to `{}`. |
| `.merges` | `ImmutableDictionary<readonly string[]>` | Templated key pairs that should merge. Each key is a `{base}` template matched against the secondary element's key; each value is an ordered list of `{base}` templates for the primary candidates to merge into. - The first primary candidate that exists in the same directory wins; remaining candidates are ignored. - If no candidate exists the secondary is left in place as its own tree element. - Defaults to `{ "{base}.md": ["{base}.ts", "{base}.tsx", "{base}.js", "{base}.jsx"] }`. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `MergingExtractor<I>` |  |

## Examples

```ts
const extractor = new MergingExtractor(new DirectoryExtractor());
```
