# SelectInput

- Kind: component
- Import: `import { SelectInput } from "shelving/ui";`

Dropdown input bound to a string value, rendered as a `<select>` of the provided `options`.
- Shows a placeholder empty option unless the field is required and already has a value.

## Signatures

```ts
SelectInput(props: SelectProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SelectProps<T>` |  |
| `.options` | `ChoiceOptions<T>` | The options for the select. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<select>` element. |

## Examples

```ts
<SelectInput name="role" options={ROLES} value={role} onValue={setRole} />
```
