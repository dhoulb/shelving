# DocumentationReferencesProps

- Kind: interface
- Import: `import { DocumentationReferencesProps } from "shelving/ui";`

Props for `DocumentationReferences` — the referenced type names to render, one row each.

## Signatures

```ts
{
	readonly types?: ImmutableArray<string> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `types` | `ImmutableArray<string> \| undefined` | Type names referenced by a `type` alias's body — one row each, resolved to links at render time. Read only. Optional. |
