# DocumentationReturn

- Kind: interface
- Import: `import { DocumentationReturn } from "shelving/util/tree";`

A single `@returns` entry — multiple allowed to document union return types separately.

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
| `type` | `string \| undefined` | Type expression for the return value; renderers default to `"unknown"` when missing. Read only. Optional. |
| `description` | `string \| undefined` | Read only. Optional. |
