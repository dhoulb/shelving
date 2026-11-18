# SchemaField

- Kind: component
- Import: `import { SchemaField } from "shelving/ui";`

Show the appropriate input for a schema, wrapped in a `<Field>` with its label and message.
- Renders custom `children` inside the field, or a `SchemaInput` when none are provided.

## Signatures

```ts
SchemaField({ schema, children, className, ...props }: SchemaFieldProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SchemaFieldProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<Field>` wrapping the schema's input. |
