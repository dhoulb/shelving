# DocumentationThrowsProps

- Kind: interface
- Import: `import { DocumentationThrowsProps } from "shelving/ui";`

Props for `DocumentationThrows` — the `@throws` entries to render, one row each.

## Signatures

```ts
{
	readonly throws?: ImmutableArray<DocumentationThrow> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `throws` | `ImmutableArray<DocumentationThrow> \| undefined` | Throw entries to render — one row per documented thrown type. Read only. Optional. |
