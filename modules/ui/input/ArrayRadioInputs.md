# ArrayRadioInputs

A column of radios, one for each item in an array. The user picks one item.

**Things to know:**

- The items can be any type, such as numbers or objects. `onValue()` gets the picked item. Items are compared with `===`.
- `formatter` turns an item into the label (default `formatValue()`). It can return any `ReactNode`.
- When the input is not `required`, an extra radio at the end picks no item. Its label is `placeholder` (default "Choose").
- For options with string keys, `<ChoiceRadioInputs>` is simpler. To pick more than one item, use `<ArrayCheckboxInputs>`.

## Usage

```tsx live
import { useState } from "react";
import { ArrayRadioInputs, Paragraph } from "shelving/ui";

function Seats() {
	const [seats, setSeats] = useState<number>();
	return (
		<>
			<ArrayRadioInputs
				name="seats"
				items={[1, 2, 4, 8]}
				formatter={n => `${n} seats`}
				placeholder="Any"
				value={seats}
				onValue={setSeats}
			/>
			<Paragraph>Seats: {seats ?? "any"}</Paragraph>
		</>
	);
}

<Seats />;
```

## Styling

`ArrayRadioInputs` has no own hooks. It is a `<Column>` of `<RadioInput>` elements, so it uses their styles. See `getInputClass()` for the `--input-*` hooks.
