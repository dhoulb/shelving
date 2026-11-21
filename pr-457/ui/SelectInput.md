# SelectInput

- Kind: component
- Import: `import { SelectInput } from "shelving/ui";`

Dropdown input bound to a string value, rendered as a `<select>` of the provided `options`.
- Shows a placeholder empty option unless the field is required and already has a value.
- With `groups`, shows each group as an `<optgroup>`, after the options that are in no group. A group key that is not in `options` is skipped.

A drop-down list, bound to a `string` value. Renders a `<select>` with an `<option>` for each of the `options`.

**Things to know:**

- `options` is a `ChoiceOptions` object in `{ key: title }` format. `onValue()` gets the key, or `undefined` for the empty option.
- It shows an empty option first (the `placeholder`, default "Choose..."). The empty option goes away when the input is `required` and has a value.
- The text is grey while the empty option is picked, and the border goes green when a value is picked.
- `groups` shows the options under headings, as `<optgroup>` elements. Options that are in no group show first.
- The select is not controlled. `value` sets the option it shows first.
- In a `<Form>`, a `ChoiceSchema` with more than 8 options (or `input: "select"`) makes this input for you. For a few options, `<ChoiceRadioInputs>` shows them all at once.

## Usage

```tsx live
import { useState } from "react";
import { Paragraph, SelectInput } from "shelving/ui";

const ROLES = { admin: "Admin", editor: "Editor", viewer: "Viewer" };

function Role() {
	const [role, setRole] = useState<string>();
	return (
		<>
			<SelectInput name="role" options={ROLES} value={role} onValue={setRole} />
			<Paragraph>Role: {role ?? "none"}</Paragraph>
		</>
	);
}

<Role />;
```

### Groups

```tsx live
import { SelectInput } from "shelving/ui";

const FOODS = { apple: "Apple", pear: "Pear", carrot: "Carrot", leek: "Leek", bread: "Bread" };
const GROUPS = { Fruit: ["apple", "pear"], Vegetables: ["carrot", "leek"] };

// "Bread" is in no group, so it shows first.
<SelectInput name="food" placeholder="Pick a food" options={FOODS} groups={GROUPS} onValue={() => {}} />;
```

## Styling

`SelectInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks. The down arrow is a background image, `--input-icon-size` square, `--input-indent` from the right edge.


## Signatures

```ts
SelectInput(props: SelectProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SelectProps<T>` |  |
| `.options` | `ChoiceOptions<T>` | The options for the select. |
| `.groups` | `ChoiceGroups<T> \| undefined` | Show the options under named headings, as `<optgroup>` elements. Options in no group show first. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<select>` element. |
