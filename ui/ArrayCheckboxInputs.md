# ArrayCheckboxInputs

- Kind: component
- Import: `import { ArrayCheckboxInputs } from "shelving/ui";`

Output a list of `<CheckboxInput>` elements for each item in an array, to pick any number of them.
- The value is the array of checked items, in the order they were checked. Items are compared with `===`.
- Checked items that are not in `items` stay in the value.
- The items can be any type, and can be formatted for output through an optional `formatter()` function.

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


## Signatures

```ts
ArrayCheckboxInputs({
	value = [],
	onValue,
	required = false,
	items,
	formatter = formatValue,
	className,
	...props
}: ArrayCheckboxInputsProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArrayCheckboxInputsProps<T>` |  |
| `.items` | `ImmutableArray<T>` | Array of values to show in the list of checkboxes. |
| `.formatter` | `((value: T) => ReactNode) \| undefined` | Function that formats an obscure item into a `ReactNode` for display. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one checkbox per item. |
