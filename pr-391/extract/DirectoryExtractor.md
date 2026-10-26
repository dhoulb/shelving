# DirectoryExtractor

- Kind: class
- Import: `import { DirectoryExtractor } from "shelving/extract";`
- Extends: `Extractor<Path, TreeElement>`

Extractor that walks a directory on disk and produces a tree of `tree-element` nodes.
- Recursively descends into subdirectories.
- Dispatches non-ignored files to a matching `FileExtractor` based on extension; files with no matching extractor are silently skipped.
- Keys on the produced elements are the verbatim filenames (e.g. `"string.ts"`, `"README.md"`) and directory names (e.g. `"util"`).
- This is a pure walker: same-key merging and README absorption are intentionally *not* applied here — wrap with `MergingExtractor`
  and/or `IndexExtractor` to opt in to those behaviours.

## Signatures

```ts
new DirectoryExtractor({ extractors = DEFAULT_EXTRACTORS, base, ignore = DEFAULT_IGNORE }: DirectoryExtractorOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `DirectoryExtractorOptions` | Defaults to `{}`. |
| `.extractors` | `ImmutableDictionary<FileExtractor>` | Extractor dispatch table keyed by file extension (without the leading dot, e.g. `"md"`). - Files with no matching extractor are silently skipped. - Defaults to `.md` (markdown), `.ts` / `.tsx` (TypeScript), and `.txt` (plain text). Read only. Optional. |
| `.base` | `AbsolutePath` | Absolute base path used to resolve relative paths passed to `extract()`. Read only. Optional. |
| `.ignore` | `Matchables` | Glob patterns for entries to skip — applied to both files and directories. - Defaults to test and spec files: `["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"]`. - Hidden entries (`.`-prefixed), underscore-prefixed entries, and `node_modules` are always skipped on top of these patterns. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `DirectoryExtractor` |  |

## Examples

```ts
const tree = await new DirectoryExtractor().extract("modules/util");
```
