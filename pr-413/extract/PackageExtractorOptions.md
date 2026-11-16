# PackageExtractorOptions

- Kind: interface
- Import: `import { PackageExtractorOptions } from "shelving/extract";`

Options for a `PackageExtractor`.

## Signatures

```ts
{
	readonly tree: TreeElement;
	readonly extensions?: ImmutableDictionary<readonly string[]>;
	readonly module?: ModuleExtractor;
	readonly base?: AbsolutePath;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `tree` | `TreeElement` | Pre-extracted source tree the `package.json` exports resolve against — typically the result of `IndexExtractor(MergingExtractor(DirectoryExtractor()))` over the source root. Read only. |
| `extensions` | `ImmutableDictionary<readonly string[]>` | Maps an export *target* file extension (the right-hand side of an `exports` entry) to the *source* extensions to look for, in order. - Bridges built output and source: `package.json` targets a `.js` file but the tree holds the `.ts` source. - The first source extension that exists in the tree wins; a target extension with no mapping falls back to itself. - Defaults to `{ js: ["ts", "tsx", "js", "jsx"] }`. Read only. Optional. |
| `module` | `ModuleExtractor` | `ModuleExtractor` used to build each module element. Defaults to a fresh `new ModuleExtractor()`. Read only. Optional. |
| `base` | `AbsolutePath` | Absolute base path used to resolve a relative `package.json` path passed to `extract()`. Read only. Optional. |
