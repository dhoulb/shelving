# ArrayCheckboxInputs

A column of checkboxes, one for each item in an array. The user picks any number of items.

**Things to know:**

- The items can be any type. `onValue()` gets the array of checked items, in the order they were checked. Items are compared with `===`.
- Checked items that are not in `items` stay in the value.
- `formatter` turns an item into the label (default `formatValue()`). It can return any `ReactNode`.
- With `required`, the user must check at least one item.
- To pick one item only, use `<ArrayRadioInputs>`.

## Usage

```tsx live
import { useState } from "react";
import { ArrayCheckboxInputs, Paragraph } from "shelving/ui";

const TOPPINGS = ["Cheese", "Tomato", "Olives", "Basil"];

function Toppings() {
	const [picked, setPicked] = useState<readonly string[]>(["Cheese"]);
	return (
		<>
			<ArrayCheckboxInputs name="toppings" items={TOPPINGS} value={picked} onValue={v => setPicked(v ?? [])} />
			<Paragraph>Toppings: {picked.join(", ") || "none"}</Paragraph>
		</>
	);
}

<Toppings />;
```

## Styling

`ArrayCheckboxInputs` has no own hooks. It is a `<Column>` of `<CheckboxInput>` elements, so it uses their styles. See `getInputClass()` for the `--input-*` hooks.
