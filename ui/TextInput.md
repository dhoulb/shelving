# TextInput

- Kind: component
- Import: `import { TextInput } from "shelving/ui";`

Single-line text input bound to a `string` value, rendered as an `<input>`. Use `TextareaInput` for multiline text.
- Applies an optional `formatter` on initial display and on blur — the raw typed value is published through `onValue`.

A single-line text input. Renders an `<input>` bound to a `string` value.

**Things to know:**

- The input is not controlled. `value` sets the text it shows first. After that, the input keeps its own text and calls `onValue()` with each change.
- To reset the text, give the input a new `key`.
- `input` sets the input type: `"text"` (the default), `"email"`, `"url"`, `"tel"`, `"password"` or `"search"`. Phones show the matching keyboard.
- `min` and `max` set the minimum and maximum length. `required` is only applied when `min` is more than 0.
- `formatter` changes the text shown when the input first shows and when it loses focus. `onValue()` always gets the raw text.
- `placeholder` defaults to `title`.
- `message` marks the input as invalid (a red border) and shows the message as a tooltip. Use `<Field>` to show the message below the input.
- For more than one line, use `<TextareaInput>`. In a `<Form>`, a `StringSchema` makes this input for you (see `<SchemaInput>`).

## Usage

### Text

```tsx live
import { useState } from "react";
import { Paragraph, TextInput } from "shelving/ui";

function Name() {
	const [name, setName] = useState("Alice");
	return (
		<>
			<TextInput name="name" title="Your name" value={name} onValue={v => setName(v ?? "")} />
			<Paragraph>Hello, {name || "stranger"}.</Paragraph>
		</>
	);
}

<Name />;
```

### Types and states

```tsx live
import { TextInput } from "shelving/ui";

<TextInput name="email" input="email" title="Email address" onValue={() => {}} />
<TextInput name="password" input="password" title="Password" min={8} required onValue={() => {}} />
<TextInput name="code" title="Code" message="This code has expired" onValue={() => {}} />
<TextInput name="locked" title="Locked" disabled onValue={() => {}} />
```

### Format on blur

```tsx live
import { TextInput } from "shelving/ui";

// The text shows in uppercase when the input loses focus.
<TextInput name="postcode" title="Postcode" formatter={s => s.toUpperCase()} onValue={() => {}} />;
```

## Styling

`TextInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks.


## Signatures

```ts
TextInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	input = "text",
	min = 0,
	max = Number.POSITIVE_INFINITY,
	formatter = PASSTHROUGH,
	className,
	...variants
}: TextInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `TextInputProps` |  |
| `.input` | `StringInputType` | Optional. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.formatter` | `TextFormatter \| undefined` | Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A text `<input>` element. |
