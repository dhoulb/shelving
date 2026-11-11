# SelectInput

- Kind: component
- Import: `import { SelectInput } from "shelving/ui";`

Dropdown input bound to a string value, rendered as a `<select>` of the provided `options`.
- Shows a placeholder empty option unless the field is required and already has a value.
- With `groups`, shows each group as an `<optgroup>`, after the options that are in no group. A group key that is not in `options` is skipped.

## Signatures

```ts
SelectInput(props: SelectProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SelectProps<T>` |  |
| `.options` | `ChoiceOptions<T>` | The options for the select. |
| `.groups` | `ChoiceGroups<T> \| undefined` | Show the options under named headings, as `<optgroup>` elements. Options in no group show first. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<select>` element. |

## Examples

```ts
<SelectInput name="role" options={ROLES} value={role} onValue={setRole} />
```
