# DocumentationPropertiesProps

- Kind: interface
- Import: `import { DocumentationPropertiesProps } from "shelving/ui";`

Props for `DocumentationProperties` — the data members of a class/interface/object-literal type to render, one row each.

## Signatures

```ts
{
	readonly properties?: ImmutableArray<DocumentationParam> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `properties` | `ImmutableArray<DocumentationParam> \| undefined` | Properties to render — one row each. Read only. Optional. |
