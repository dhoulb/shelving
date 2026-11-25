# ChoiceSchemaInput

- Kind: component
- Import: `import { ChoiceSchemaInput } from "shelving/ui";`

Show a choice input for a `ChoiceSchema` — radio inputs or a select.

- The schema's `input` picks the control: `"radio"` for radio inputs, `"select"` for a select.
- The value is normalised through the schema's `get()`, so invalid or sentinel values (e.g. a `CountrySchema`'s `"detect"`) resolve to a real option or fall back to the placeholder rather than mis-selecting the first option.

## Signatures

```ts
ChoiceSchemaInput({ schema, value, ...props }: ChoiceSchemaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ChoiceSchemaInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `ChoiceRadioInputs` or `SelectInput` element bound to the schema. |

## Examples

```ts
<ChoiceSchemaInput name="role" schema={ROLE} />
```
