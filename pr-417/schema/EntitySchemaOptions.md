# EntitySchemaOptions

- Kind: interface
- Import: `import { EntitySchemaOptions } from "shelving/schema";`
- Extends: `StringSchemaOptions`

Options for `EntitySchema`.

## Signatures

```ts
{
	readonly types?: ImmutableArray<T> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `types` | `ImmutableArray<T> \| undefined` | Restrict the allowed entity types; any other type is rejected. Read only. Optional. |
