# DocumentationThrow

- Kind: interface
- Import: `import { DocumentationThrow } from "shelving/util/tree";`

A single `@throws` entry — multiple allowed to document distinct error types.

## Signatures

```ts
{
	readonly type?: string | undefined;
	readonly description?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string \| undefined` | Type expression for the thrown value; renderers default to `"unknown"` when missing. Read only. Optional. |
| `description` | `string \| undefined` | Read only. Optional. |
