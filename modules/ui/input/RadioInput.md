# RadioInput

One radio button with a label. Renders a `<label>` that looks like an input, with an `<input type="radio">` inside.

**Things to know:**

- Radios with the same `name` make a group, so only one can be picked.
- `value` is `true` when this radio is picked first. When the user picks it, `onValue()` gets `true`. It is never called with `false`.
- The children are the label. With no children, the label is `placeholder`, then `title`, then "Choose".
- The border goes green when the radio is picked.
- Usually you want a whole group: use `<ChoiceRadioInputs>` for a set of options, or `<ArrayRadioInputs>` for an array of items.

## Usage

```tsx live
import { useState } from "react";
import { Paragraph, RadioInput } from "shelving/ui";

function Plan() {
	const [plan, setPlan] = useState("free");
	return (
		<>
			<RadioInput name="plan" value={plan === "free"} onValue={() => setPlan("free")}>
				Free
			</RadioInput>
			<RadioInput name="plan" value={plan === "pro"} onValue={() => setPlan("pro")}>
				Pro
			</RadioInput>
			<Paragraph>Plan: {plan}</Paragraph>
		</>
	);
}

<Plan />;
```

## Styling

`RadioInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks. The radio uses the browser's own control, coloured with `accent-color: var(--color-success)`, and is `--input-icon-size` square.
