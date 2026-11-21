# ArrayRadioInputs

- Kind: component
- Import: `import { ArrayRadioInputs } from "shelving/ui";`

Output a list of `<RadioInput>` elements for each item in an array.
- The items can be any type, and can be formatted for output through an optional `formatter()` function.
- A `placeholder` option is shown at the bottom if `required=false`.

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


## Signatures

```ts
ArrayRadioInputs({
	value,
	onValue,
	required = false,
	items,
	formatter = formatValue,
	className,
	...props
}: ArrayRadioInputsProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ArrayRadioInputsProps<T>` |  |
| `.items` | `ImmutableArray<T>` | Array of values to show in the list of radios. |
| `.formatter` | `((value: T) => ReactNode) \| undefined` | Function that formats an obscure item into a `ReactNode` for display. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one radio per item plus an optional empty placeholder radio. |
