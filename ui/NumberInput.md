# NumberInput()

- Kind: function
- Import: `import { NumberInput } from "shelving/ui";`

Numeric input bound to a `number` value, parsing typed text and reformatting it on blur.
- Uses `type="text"` with `inputMode="decimal"` so a custom `formatter` can control display.

## Signatures

```ts
NumberInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	// min = Number.NEGATIVE_INFINITY,
	// max = Number.POSITIVE_INFINITY,
	formatter = formatNumber,
	className,
	...variants
}: NumberInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `NumberInputProps` |  |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.formatter` | `NumberFormatter \| undefined` | Optional formatter — when provided the input switches to `type="text"` and reformats the value on blur. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A numeric `<input>` element. |

## Examples

```ts
<NumberInput name="age" value={age} onValue={setAge} />
```
