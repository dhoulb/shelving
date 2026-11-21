# MergingExtractorOptions

- Kind: interface
- Import: `import { MergingExtractorOptions } from "shelving/extract";`

Options for a `MergingExtractor`.

## Signatures

```ts
{
	readonly merges?: ImmutableDictionary<readonly string[]>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `merges` | `ImmutableDictionary<readonly string[]>` | Templated key pairs that should merge. Each key is a `{base}` template matched against the secondary element's key; each value is an ordered list of `{base}` templates for the primary candidates to merge into. - The first primary candidate that exists in the same directory wins; remaining candidates are ignored. - If no candidate exists the secondary is left in place as its own tree element. - Defaults to `{ "{base}.md": ["{base}.ts", "{base}.tsx", "{base}.js", "{base}.jsx"] }`. Read only. Optional. |
