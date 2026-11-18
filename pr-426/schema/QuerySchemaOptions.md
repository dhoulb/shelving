# QuerySchemaOptions

- Kind: interface
- Import: `import { QuerySchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `QuerySchema`.

## Signatures

```ts
{
	readonly data: DataSchema<T>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `data` | `DataSchema<T>` | Schema for the data objects the query filters and sorts. Read only. |
