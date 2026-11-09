# StringSchemaInput

- Kind: component
- Import: `import { StringSchemaInput } from "shelving/ui";`

Show a `TextInput` for a `StringSchema`, or a `TextareaInput` when the schema is `multiline`, sanitising and formatting values with the schema.
- Publishes the sanitized value through `onValue`; the schema's `format()` only shapes what the input displays (on first render and on blur).
- A `TextareaInput` starts at the schema's `rows` (2 by default for a multiline schema).

## Signatures

```ts
StringSchemaInput({ schema, value, onValue, ...props }: StringSchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `StringSchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `TextInput` or `TextareaInput` element bound to the schema. |

## Examples

```ts
<StringSchemaInput name="email" schema={EMAIL} />
```
