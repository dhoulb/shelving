# TextInput()

- Kind: function
- Import: `import { TextInput } from "shelving/ui";`

Single-line text input bound to a `string` value, rendered as an `<input>`. Use `TextareaInput` for multiline text.
- Applies an optional `formatter` on initial display and on blur — the raw typed value is published through `onValue`.

## Signatures

```ts
TextInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	input = "text",
	min = 0,
	max = Number.POSITIVE_INFINITY,
	formatter = PASSTHROUGH,
	className,
	...variants
}: TextInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `TextInputProps` |  |
| `.input` | `StringInputType` | Optional. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.formatter` | `TextFormatter \| undefined` | Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A text `<input>` element. |

## Examples

```ts
<TextInput name="name" value={name} onValue={setName} />
```
