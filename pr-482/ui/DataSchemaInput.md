# DataSchemaInput

- Kind: component
- Import: `import { DataSchemaInput } from "shelving/ui";`

Show a `DataInput` for a nested `DataSchema`.

## Signatures

```ts
DataSchemaInput({ schema, value, ...props }: DataSchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DataSchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `DataInput` element bound to the schema. |

## Examples

```ts
<DataSchemaInput name="address" schema={ADDRESS} />
```
