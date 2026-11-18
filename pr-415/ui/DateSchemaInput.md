# DateSchemaInput

- Kind: component
- Import: `import { DateSchemaInput } from "shelving/ui";`

Show a `DateInput` for a `DateSchema`.

## Signatures

```ts
DateSchemaInput({ schema, value, ...props }: DateSchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DateSchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `DateInput` element bound to the schema. |

## Examples

```ts
<DateSchemaInput name="dob" schema={DATE} />
```
