# ChoiceRadioInputs

- Kind: component
- Import: `import { ChoiceRadioInputs } from "shelving/ui";`

Output a list of `<RadioInput>` elements for each item in a set of `ChoiceOptions` in `{ key: title }` format.
- This is the same type a `ChoiceSchema` uses for its `.options` field.
- A `placeholder` option is shown at the bottom if `required=false`.

## Signatures

```ts
ChoiceRadioInputs(props: ChoiceRadioInputsProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ChoiceRadioInputsProps<T>` |  |
| `.options` | `ChoiceOptions<T>` | Options for the radios. |
| `.wrap` | `boolean` | Wrap the radios onto multiple rows if needed. Optional. |
| `.column` | `boolean` | Display the radios in a column rather than a row. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one radio per option plus an optional empty placeholder radio. |

## Examples

```ts
<ChoiceRadioInputs name="role" options={{ admin: "Admin", user: "User" }} value={role} onValue={setRole} />
```
