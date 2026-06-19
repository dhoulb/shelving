# Field

The visual wrapper for a single form control. `Field` renders a `<label>` with an optional title and description above the input, and an inline error message below it. Use it when composing inputs by hand rather than relying on the automatic fields rendered by `<Form>`.

**Things to know:**

- Full width by default (one field per row). Pass `half` to render at 50% so two fields sit side-by-side.
- The `message` prop renders below the input as an error `<Message>` — wire it to the field's error string.
- `<FormInput>` combines a field's value, error, and schema lookup from the surrounding `FormContext`; reach for `Field` directly when you want explicit control over the label and layout.

## Usage

### Standalone field

```tsx
import { Field, TextInput } from "shelving/ui";

<Field title="Email address" message={emailError}>
  <TextInput name="email" value={email} onValue={setEmail} required />
</Field>
```

### Two-up layout

```tsx
import { Field, TextInput } from "shelving/ui";

<Field title="First name" half>
  <TextInput name="first" value={first} onValue={setFirst} />
</Field>
<Field title="Last name" half>
  <TextInput name="last" value={last} onValue={setLast} />
</Field>
```

## Styling

`Field` paints its label, description, and message text. Override these hooks at `:root` or any ancestor scope.

| Variable | Styles | Default |
|---|---|---|
| `--field-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |
| `--field-gap` | Gap between label, control, and message | `var(--space-xsmall)` |
| `--field-title-size` | Title font size | `var(--size-normal)` |
| `--field-title-weight` | Title font weight | `var(--weight-strong)` |
| `--field-color-title` | Title colour | `var(--tint-00)` |
| `--field-description-size` | Description font size | `var(--size-normal)` |
| `--field-description-weight` | Description font weight | `var(--weight-normal)` |
| `--field-color-description` | Description colour | `var(--shade-dark)` |
| `--field-message-weight` | Message font weight | `var(--weight-strong)` |
| `--field-color-message` | Message colour | `var(--color-red)` |

**Global tokens it reads:** the tint ladder `--tint-00`, plus `--space-paragraph`, `--space-xsmall`, `--size-normal`, `--weight-strong`, `--weight-normal`, `--shade-dark`, and `--color-red`.
