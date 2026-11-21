# getInputClass

Get the base class names for a form input. Every input in `shelving/ui` uses it, so they all share one look: the same border, padding, height and focus ring.

**Things to know:**

- It adds the shared `.input` class plus the classes for any `InputVariants` (`space`, `padding`, `indent`, `width` and typography).
- Use it to make your own control look like an input. Add your own classes after it with `getClass()`.
- An input and a `<Button>` with an icon have the same height.
- An input shows a green border when it has a valid value, and a red border when its value is not valid or `message` is set.
- The styles below belong to the `.input` class, so they apply to every input: `<TextInput>`, `<TextareaInput>`, `<NumberInput>`, `<DateInput>`, `<FileInput>`, `<SelectInput>`, `<CheckboxInput>`, `<RadioInput>`, `<ButtonInput>`, `<OutputInput>` and `<InputWrapper>`.

## Usage

```tsx
import { getClass, getInputClass } from "shelving/ui";

function ColorInput({ value, onValue, ...variants }: ColorInputProps) {
	return (
		<input
			type="color"
			defaultValue={value}
			onChange={e => onValue(e.currentTarget.value)}
			className={getClass(getInputClass(variants), "color-input")}
		/>
	);
}
```

## Styling

Every input reads these hooks. Override these hooks at `:root`. The tint hooks (`--input-border`, `--input-background`, `--input-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable                   | Styles                                                                 | Default                            |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| `--input-background`       | Background                                                             | `var(--tint-100)`                  |
| `--input-color`            | Text colour                                                            | `var(--tint-00)`                   |
| `--input-border`           | Border colour (width is `--input-stroke`)                              | `var(--tint-80)`                   |
| `--input-stroke`           | Border width (one length)                                              | `var(--stroke-normal)` (1px)       |
| `--input-radius`           | Corner radius                                                          | `var(--radius-xsmall)` (8px)       |
| `--input-space`            | Outer block margin (top and bottom)                                    | `var(--space-small)` (12px)        |
| `--input-padding`          | Inner top and bottom padding (one length)                              | `var(--space-small)` (12px)        |
| `--input-indent`           | Inner left and right padding (one length)                              | `var(--space-small)` (12px)        |
| `--input-icon-size`        | Size of an icon in the input, which also sets the minimum height       | `var(--size-icon)` (24px)          |
| `--input-transition`       | Transition                                                             | `all var(--duration-fast)` (150ms) |
| `--input-focus-border`     | Focus outline colour (width is `--stroke-focus`)                       | `var(--color-focus)`               |
| `--input-font`             | Font family                                                            | `var(--font-body)`                 |
| `--input-weight`           | Font weight                                                            | `var(--weight-normal)` (400)       |
| `--input-size`             | Font size                                                              | `var(--size-normal)` (16px)        |
| `--input-leading`          | Line height                                                            | `var(--leading-auto)`              |
| `--input-rows`             | Minimum rows of a `<TextareaInput>` (its `rows` prop sets this inline) | `2`                                |
| `--input-disabled-opacity` | Opacity of a disabled input                                            | `0.5`                              |

**Global tokens it reads:** the tint ladder `--tint-00` / `--tint-70` (placeholder text) / `--tint-80` / `--tint-100`, plus `--stroke-normal`, `--stroke-focus`, `--radius-xsmall`, `--space-small`, `--size-icon`, `--duration-fast`, `--font-body`, `--weight-normal`, `--size-normal`, `--leading-auto`, and the status colours `--color-focus`, `--color-success`, `--color-failure` and `--color-green`.
