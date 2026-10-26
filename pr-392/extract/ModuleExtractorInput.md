# ModuleExtractorInput

- Kind: interface
- Import: `import { ModuleExtractorInput } from "shelving/extract";`

Input for a `ModuleExtractor`.

## Signatures

```ts
{
	readonly name: string;
	readonly source: TreeElement;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `name` | `string` | Display name for the module, derived from the package.json export key (e.g. `"util/string"`, `"firebase"`). Read only. |
| `source` | `TreeElement` | The source element this module is built from. - A file-backed `tree-element` — the module is backed by a single source file (with its `.md` sibling already merged in by `MergingExtractor`). - A directory-backed `tree-element` — the module is backed by a directory; its absorbed index file provides the content. Read only. |
