# FormInput

- Kind: component
- Import: `import { FormInput } from "shelving/ui";`

Show a `SchemaInput` for a single named property of the current form.
- Reads the field's value, schema, and message from the form context via `useField()`.

## Signatures

```ts
FormInput({ name, ...props }: FormInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `FormInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `SchemaInput` bound to the named field. |

## Examples

```ts
<FormInput name="email" />
```
