# TextareaInput()

- Kind: function
- Import: `import { TextareaInput } from "shelving/ui";`

Multiline text input bound to a `string` value, rendered as a `<textarea>` that grows to fit its content.
- Applies an optional `formatter` on initial display and on blur — the raw typed value is published through `onValue`.

## Signatures

```ts
TextareaInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	rows = 2,
	formatter = PASSTHROUGH,
	className,
	...variants
}: TextareaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `TextareaInputProps` |  |
| `.rows` | `number \| undefined` | Rows the textarea shows at first (its minimum height). It grows to fit its content. Defaults to `2`. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.formatter` | `TextFormatter \| undefined` | Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<textarea>` element. |

## Examples

```ts
<TextareaInput name="bio" rows={4} value={bio} onValue={setBio} />
```
