# ModuleExtractor

- Kind: class
- Import: `import { ModuleExtractor } from "shelving/extract";`
- Extends: `Extractor<ModuleExtractorInput, DocumentationElement>`

Extractor that builds a `kind: "module"` `DocumentationElement` from a source file or directory.
- The module's `content`, `description`, and `title` are taken from the source element (`MergingExtractor` and
  `IndexExtractor` are expected to have run upstream so `.md` siblings and `README.md` are already folded in).
- The module's `children` are every `tree-documentation` element found by deep-walking the source — flattened across
  files and subdirectories, but never descending into a `tree-documentation`'s own members.

## Signatures

```ts
new ModuleExtractor()
```

## Returns

| Type | Description |
| --- | --- |
| `ModuleExtractor` |  |

## Examples

```ts
const module = new ModuleExtractor().extract({ name: "util/string", source });
```
