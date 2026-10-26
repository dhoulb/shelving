# FileExtractor

- Kind: class
- Import: `import { FileExtractor } from "shelving/extract";`
- Extends: `Extractor<BunFile, TreeElement>`

Base extractor for a file in a tree.
- Reads the file's content as text and stores it in `content`.
- Sets `source` to the file's absolute path (`BunFile.name`); throws `RequiredError` if missing or non-absolute.
- Sets `name` to the basename without extension, preserving case (e.g. `"OptionalSchema"` from `"OptionalSchema.ts"`); URL paths use `name`.
- Sets `key` to the verbatim filename including extension (e.g. `"OptionalSchema.ts"`). Keys are unique within a directory
  and used by `MergingExtractor` to pair siblings (`{base}.md` + `{base}.ts`) and by `PackageExtractor` to look up sources.
- Does NOT set `title` — `title` is only set by subclasses that have a confident source for one (e.g. `MarkupExtractor` uses the first `<h1>`). Renderers fall back to `name` when missing.
- Subclasses (e.g. `MarkupExtractor`, `TypescriptExtractor`) override `extractProps()` to parse the content into richer elements.

## Signatures

```ts
new FileExtractor()
```

## Returns

| Type | Description |
| --- | --- |
| `FileExtractor` |  |

## Examples

```ts
new FileExtractor().extract(Bun.file("/abs/path/notes.txt"))
```

## Methods

- [FileExtractor.extract()](FileExtractor/extract.md): Read a file and build a tree-element from its text content.
- [FileExtractor.extractProps()](FileExtractor/extractProps.md): Build the file element props from the extracted content.
