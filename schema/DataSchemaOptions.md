# DataSchemaOptions

- Kind: interface
- Import: `import { DataSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `DataSchema`.

## Signatures

```ts
{
	readonly props: Schemas<T>;
	readonly value?: Partial<T> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `props` | `Schemas<T>` | A named schema for each property the data object must have. Read only. |
| `value` | `Partial<T> \| undefined` | Partial default value merged over the per-prop defaults. Read only. Optional. |
