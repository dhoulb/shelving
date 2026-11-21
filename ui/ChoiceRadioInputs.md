# ChoiceRadioInputs

- Kind: component
- Import: `import { ChoiceRadioInputs } from "shelving/ui";`

Output a list of `<RadioInput>` elements for each item in a set of `ChoiceOptions` in `{ key: title }` format.
- This is the same type a `ChoiceSchema` uses for its `.options` field.
- A `placeholder` option is shown at the bottom if `required=false`.

A group of radios, one for each option in a `ChoiceOptions` object. The user picks one option.

**Things to know:**

- `options` is in `{ key: title }` format, the same as `ChoiceSchema.options`. `onValue()` gets the key of the picked option.
- When the input is not `required`, an extra radio at the end picks no option. Its label is `placeholder` (default "Choose").
- Two options show side by side in a row. More than two show in a column. Set `column` to choose, or `wrap` to let a row wrap.
- In a `<Form>`, a `ChoiceSchema` with 8 options or fewer makes this input for you. For more options, use `<SelectInput>`.

## Usage

```tsx live
import { useState } from "react";
import { ChoiceRadioInputs, Paragraph } from "shelving/ui";

const SIZES = { s: "Small", m: "Medium", l: "Large" };

function Size() {
	const [size, setSize] = useState<string | undefined>("m");
	return (
		<>
			<ChoiceRadioInputs name="size" options={SIZES} value={size} onValue={setSize} required />
			<Paragraph>Size: {size ?? "none"}</Paragraph>
		</>
	);
}

<Size />;
```

### Two options, not required

```tsx live
import { ChoiceRadioInputs } from "shelving/ui";

// Two options show in a row. The last radio picks no option.
<ChoiceRadioInputs name="answer" options={{ yes: "Yes", no: "No" }} placeholder="Not sure" onValue={() => {}} />;
```

## Styling

`ChoiceRadioInputs` has no own hooks. It is a `<Row>` of `<RadioInput>` elements, so it uses their styles. See `getInputClass()` for the `--input-*` hooks.


## Signatures

```ts
ChoiceRadioInputs(props: ChoiceRadioInputsProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ChoiceRadioInputsProps<T>` |  |
| `.options` | `ChoiceOptions<T>` | Options for the radios. |
| `.wrap` | `boolean` | Wrap the radios onto multiple rows if needed. Optional. |
| `.column` | `boolean` | Display the radios in a column rather than a row. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one radio per option plus an optional empty placeholder radio. |
