# RadioInput()

- Kind: function
- Import: `import { RadioInput } from "shelving/ui";`

Single `<input type="radio">` wrapped in a `<label>` styled as an `<Input>`.
- Calls `onValue(true)` when selected; label content comes from `children`, falling back to `placeholder`/`title`.

## Signatures

```ts
RadioInput({
	name,
	title,
	placeholder = title || "Choose",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children = placeholder,
	className,
	...props
}: RadioInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `RadioInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<label>` wrapping the radio button and its label content. |

## Examples

```ts
<RadioInput name="plan" value={isPro} onValue={selectPro}>Pro</RadioInput>
```
