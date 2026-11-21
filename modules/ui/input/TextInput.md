# TextInput

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
