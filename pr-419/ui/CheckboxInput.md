# CheckboxInput()

- Kind: function
- Import: `import { CheckboxInput } from "shelving/ui";`

Checkbox input bound to a `boolean` value, rendered as a labelled `<input type="checkbox">`.
- The label content comes from `children`, falling back to `placeholder`/`title`.

## Signatures

```ts
CheckboxInput({
	name,
	title,
	placeholder = title || "Yes",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children = placeholder,
	className,
	...props
}: CheckboxProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `CheckboxProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<label>` wrapping the checkbox and its label content. |

## Examples

```ts
<CheckboxInput name="agree" value={agree} onValue={setAgree}>I agree</CheckboxInput>
```
