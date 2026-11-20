# IndexExtractorOptions

- Kind: interface
- Import: `import { IndexExtractorOptions } from "shelving/extract";`

Options for an `IndexExtractor`.

## Signatures

```ts
{
	readonly index?: Matchables;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `index` | `Matchables` | Filename patterns treated as a parent's index. Matched case-insensitively against each child element's `key`. - Defaults to README and index files: `["readme.txt", "readme.md", "index.md", "index.ts", "index.tsx"]`. Read only. Optional. |
