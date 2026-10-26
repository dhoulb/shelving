# DirectoryExtractorOptions

- Kind: interface
- Import: `import { DirectoryExtractorOptions } from "shelving/extract";`

Options for a directory extractor.

## Signatures

```ts
{
	readonly extractors?: ImmutableDictionary<FileExtractor>;
	readonly base?: AbsolutePath;
	readonly ignore?: Matchables;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `extractors` | `ImmutableDictionary<FileExtractor>` | Extractor dispatch table keyed by file extension (without the leading dot, e.g. `"md"`). - Files with no matching extractor are silently skipped. - Defaults to `.md` (markdown), `.ts` / `.tsx` (TypeScript), and `.txt` (plain text). Read only. Optional. |
| `base` | `AbsolutePath` | Absolute base path used to resolve relative paths passed to `extract()`. Read only. Optional. |
| `ignore` | `Matchables` | Glob patterns for entries to skip — applied to both files and directories. - Defaults to test and spec files: `["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"]`. - Hidden entries (`.`-prefixed), underscore-prefixed entries, and `node_modules` are always skipped on top of these patterns. Read only. Optional. |
