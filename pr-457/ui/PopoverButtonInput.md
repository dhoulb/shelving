# PopoverButtonInput

- Kind: component
- Import: `import { PopoverButtonInput } from "shelving/ui";`

Popover variant of `<ButtonInput>` — an input-styled button that reveals floating popover content beside it when clicked.
- The button is the primary element: it takes the shared `InputProps`, and `className` lands on it (not the popover panel).
- The first element passed to `children` is the button label; the rest become the popover contents.

DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.

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


## Signatures

```ts
PopoverButtonInput({
	children: [buttonChildren, ...popoverChildren], //
	className,
	...props
}: PopoverButtonInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `PopoverButtonInputProps` |  |
| `.children` | `PopoverChildren` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `ButtonInput` that toggles its attached `Popover` open and closed. |
