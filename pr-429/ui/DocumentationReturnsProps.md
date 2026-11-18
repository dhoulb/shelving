# DocumentationReturnsProps

- Kind: interface
- Import: `import { DocumentationReturnsProps } from "shelving/ui";`

Props for `DocumentationReturns` — the `@returns` entries to render, one row each.

## Signatures

```ts
{
	readonly returns?: ImmutableArray<DocumentationReturn> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `returns` | `ImmutableArray<DocumentationReturn> \| undefined` | Return entries to render — one row per documented return type. Read only. Optional. |
