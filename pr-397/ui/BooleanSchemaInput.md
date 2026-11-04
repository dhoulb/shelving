# BooleanSchemaInput

- Kind: component
- Import: `import { BooleanSchemaInput } from "shelving/ui";`

Show a `CheckboxInput` for a `BooleanSchema`.

## Signatures

```ts
BooleanSchemaInput({ schema, value, ...props }: BooleanSchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `BooleanSchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `CheckboxInput` element bound to the schema. |

## Examples

```ts
<BooleanSchemaInput name="agree" schema={BOOLEAN} />
```
