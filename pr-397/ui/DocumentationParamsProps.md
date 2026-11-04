# DocumentationParamsProps

- Kind: interface
- Import: `import { DocumentationParamsProps } from "shelving/ui";`

Props for `DocumentationParams` — the parameter list to render, one row per parameter.

## Signatures

```ts
{
	readonly params?: ImmutableArray<DocumentationParam> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `params` | `ImmutableArray<DocumentationParam> \| undefined` | Parameters to render — one row each, with options-bag params flattened into indented child rows. Read only. Optional. |
