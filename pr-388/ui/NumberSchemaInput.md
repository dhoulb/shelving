# NumberSchemaInput

- Kind: component
- Import: `import { NumberSchemaInput } from "shelving/ui";`

Show a `NumberInput` for a `NumberSchema`, formatting values with the schema's `format()`.

## Signatures

```ts
NumberSchemaInput({ schema, value, ...props }: NumberSchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `NumberSchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `NumberInput` element bound to the schema. |

## Examples

```ts
<NumberSchemaInput name="age" schema={NUMBER} />
```
