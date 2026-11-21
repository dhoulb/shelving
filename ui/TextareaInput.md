# TextareaInput

- Kind: component
- Import: `import { TextareaInput } from "shelving/ui";`

Multiline text input bound to a `string` value, rendered as a `<textarea>` that grows to fit its content.
- Applies an optional `formatter` on initial display and on blur — the raw typed value is published through `onValue`.

A text input for more than one line. Renders a `<textarea>` bound to a `string` value. It grows to fit its text.

**Things to know:**

- The input is not controlled. `value` sets the text it shows first. After that, it keeps its own text and calls `onValue()` with each change.
- `rows` sets the minimum height in lines (default 2). The textarea grows as the text gets longer. It is never shorter than a single-line input.
- Browsers that do not support `field-sizing` (such as Firefox) grow it with a script.
- `min` and `max` set the minimum and maximum length. `formatter` works the same as on `<TextInput>`.
- In a `<Form>`, a `StringSchema` with `multiline: true` makes this input for you.

## Usage

```tsx live
import { TextareaInput } from "shelving/ui";

<TextareaInput name="bio" title="Tell us about yourself" rows={3} onValue={() => {}} />;
```

### Start with text

```tsx live
import { TextareaInput } from "shelving/ui";

<TextareaInput name="notes" value={"First line.\nSecond line.\nType more to make it grow."} onValue={() => {}} />;
```

## Styling

`TextareaInput` uses the shared input styles. See `getInputClass()` for the `--input-*` hooks. Its minimum height reads `--input-rows`, which the `rows` prop sets.


## Signatures

```ts
TextareaInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	rows = 2,
	formatter = PASSTHROUGH,
	className,
	...variants
}: TextareaInputProps): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `variants` | `TextareaInputProps` |  |
| `.rows` | `number \| undefined` | Rows the textarea shows at first (its minimum height). It grows to fit its content. Defaults to `2`. |
| `.min` | `number \| undefined` | Optional. |
| `.max` | `number \| undefined` | Optional. |
| `.formatter` | `TextFormatter \| undefined` | Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<textarea>` element. |
