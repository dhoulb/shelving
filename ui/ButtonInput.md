# ButtonInput

- Kind: component
- Import: `import { ButtonInput } from "shelving/ui";`

Return either a `<button>` or an `<a href="">` styled as an input, based on whether an `onClick` or `href` prop is provided.
- Falls back to rendering the `placeholder` when no `children`/`title` content is supplied.

A button that looks like an input. Renders a `<button>`, or an `<a>` when `href` is set.

**Things to know:**

- Use it for a control that opens something else, such as a picker or a dialog, but sits in a form like an input.
- The children are the content. With no children it shows `title`, then `placeholder` in grey.
- Set `onClick` for a button or `href` for a link, the same as `<Button>`.
- The text is centred and does not wrap. Long text is cut off.
- `<PopoverButtonInput>` is a `ButtonInput` that opens a popover. `<ArrayInput>` and `<DictionaryInput>` use one when they are empty.

## Usage

```tsx live
import { useState } from "react";
import { ButtonInput } from "shelving/ui";

const COLOURS = ["Red", "Green", "Blue"];

function Colour() {
	const [i, setI] = useState<number>();
	return (
		<ButtonInput name="colour" placeholder="Choose a colour…" onClick={() => setI(((i ?? -1) + 1) % COLOURS.length)}>
			{i === undefined ? undefined : COLOURS[i]}
		</ButtonInput>
	);
}

<Colour />;
```

## Styling

`ButtonInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks.


## Signatures

```ts
ButtonInput({ title, placeholder, children = title, className, ...props }: ButtonInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `ButtonInputProps` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `Clickable` element styled with the button-input class. |
