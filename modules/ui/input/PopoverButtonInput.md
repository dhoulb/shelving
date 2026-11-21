# PopoverButtonInput

A `<ButtonInput>` that opens a `<Popover>` panel below it. Use it for a custom picker in a form.

**Things to know:**

- The first child is the button content. The other children go in the panel.
- It takes the shared input props, such as `name`, `placeholder` and `disabled`. `className` goes on the button.
- A tap outside the popover, or the Escape key, closes the panel.
- The panel does not close when the user picks something in it. Close it yourself, or use `<QueryRadiosInput>` for a list that closes on a pick.

## Usage

```tsx live
import { useState } from "react";
import { ArrayRadioInputs, PopoverButtonInput } from "shelving/ui";

function Fruit() {
	const [fruit, setFruit] = useState<string>();
	return (
		<PopoverButtonInput name="fruit" placeholder="Choose a fruit…">
			{fruit}
			<ArrayRadioInputs name="fruit-list" items={["Apple", "Pear", "Plum"]} value={fruit} onValue={setFruit} required />
		</PopoverButtonInput>
	);
}

<Fruit />;
```

## Styling

`PopoverButtonInput` has no own hooks. The button uses the shared input styles (see `getInputClass()`) and the panel uses the `<Popover>` styles.
