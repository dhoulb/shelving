# CheckboxInput

A checkbox with a label, bound to a `boolean` value. Renders a `<label>` that looks like an input, with an `<input type="checkbox">` inside.

**Things to know:**

- The children are the label. With no children, the label is `placeholder`, then `title`, then "Yes".
- The whole box is the tap target, not only the checkbox.
- The border goes green when the checkbox is checked.
- The checkbox is not controlled. `value` sets whether it is checked first. To change it from outside, give it a new `key`.
- `onValue()` gets `true` or `false`.
- Composes the flex variants, so `width="fit"` makes the box only as wide as its label.
- In a `<Form>`, a `BooleanSchema` makes this input for you. To pick more than one item from a list, use `<ArrayCheckboxInputs>`.

## Usage

```tsx live
import { useState } from "react";
import { CheckboxInput, Paragraph } from "shelving/ui";

function Terms() {
	const [agree, setAgree] = useState(false);
	return (
		<>
			<CheckboxInput name="agree" value={agree} onValue={v => setAgree(!!v)}>
				I agree to the terms
			</CheckboxInput>
			<Paragraph>{agree ? "Thank you." : "Please agree to continue."}</Paragraph>
		</>
	);
}

<Terms />;
```

### States

```tsx live
import { CheckboxInput } from "shelving/ui";

<CheckboxInput name="news" value onValue={() => {}}>Send me news</CheckboxInput>
<CheckboxInput name="fit" width="fit" onValue={() => {}}>Only as wide as its label</CheckboxInput>
<CheckboxInput name="off" disabled onValue={() => {}}>Not available</CheckboxInput>
```

## Styling

`CheckboxInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks. The checkbox uses the browser's own control, coloured with `accent-color: var(--color-success)`, and is `--input-icon-size` square.
