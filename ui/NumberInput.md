# NumberInput

- Kind: component
- Import: `import { NumberInput } from "shelving/ui";`

Numeric input bound to a `number` value, parsing typed text and reformatting it on blur.
- Uses `type="text"` with `inputMode="decimal"` so a custom `formatter` can control display.

A number input. Renders an `<input>` bound to a `number` value.

**Things to know:**

- It is a text input with `inputMode="decimal"`, so phones show a number keyboard and the browser shows no up and down arrows.
- `onValue()` gets the typed text as a number, or `undefined` when the text is not a number.
- When the input loses focus, it formats the number with `formatter` (default `formatNumber()`, for example `1,234.5`). Text that is not a number is cleared.
- The input is not controlled. `value` sets the number it shows first.
- In a `<Form>`, a `NumberSchema` makes this input for you, and formats with the schema.

## Usage

```tsx live
import { useState } from "react";
import { NumberInput, Paragraph } from "shelving/ui";

function Quantity() {
	const [count, setCount] = useState<number | undefined>(1200);
	return (
		<>
			<NumberInput name="count" title="Quantity" value={count} onValue={setCount} />
			<Paragraph>Double: {count === undefined ? "none" : count * 2}</Paragraph>
		</>
	);
}

<Quantity />;
```

### Custom format

```tsx live
import { NumberInput } from "shelving/ui";

<NumberInput name="price" title="Price" value={9.5} formatter={n => `£${n.toFixed(2)}`} onValue={() => {}} />;
```

## Styling

`NumberInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks.


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
