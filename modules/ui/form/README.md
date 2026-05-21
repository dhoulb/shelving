# Forms

Forms and inputs for shelving apps. Build validated, schema-driven forms from a handful of composable pieces, or drop in a single `<Form>` component for a fully automatic experience.

## Concepts

### FormStore — form state

`FormStore` is the brain of every form. It extends `DataStore` and owns:

- The current (partial) field values.
- A `messages` dictionary — error strings keyed by field name, plus a top-level `""` key for form-wide messages.
- A `validated` getter that runs the schema and returns fully-typed data or throws a string on failure.
- A `publish(name, value)` method that validates a single field, writes the result, and stores any per-field error.
- A `submit(callback)` method that validates the whole form and, if valid, runs the callback.

When `submit` calls the callback and the callback throws a plain **string**, `FormStore` parses it into field messages using the `"fieldName: message"` line format from [schema](/schema). Any non-string throw is surfaced as a global error notice. A successful return value is dispatched as a success notice.

You rarely create `FormStore` directly — `<Form>` does it for you — but you can grab it from context with `requireForm()` when you need it.

### `<Form>` — the outer wrapper

`<Form>` creates a `FormStore` from a `schema` prop, wraps everything in an HTML `<form>`, disables the whole fieldset while busy, and calls `onSubmit` on a valid submit. If you provide no `children`, it renders `<FormFields>` (one auto-input per schema property) followed by `<FormFooter>` (submit button + error message).

```tsx
import { Form } from "shelving/ui";
import { DATA, STRING, NumberSchema } from "shelving/schema";

const PRODUCT_SCHEMA = DATA({
  name: new StringSchema({ title: "Name", min: 1, max: 100 }),
  price: new NumberSchema({ title: "Price", min: 0 }),
});

export function NewProductForm() {
  return (
    <Form
      schema={PRODUCT_SCHEMA}
      submit="Create product"
      onSubmit={async data => {
        await createProduct(data);
        return "Product created"; // dispatched as a success notice
      }}
    />
  );
}
```

Pass `data` to pre-populate an edit form. Pass `messages` (a string or dictionary) to seed initial field errors — useful when a server returns validation failures.

### `<Field>` — label + input + error

`<Field>` is the visual wrapper for a single control. It renders a `<label>` with an optional title, description, and inline error message below the input. Use it when composing inputs by hand rather than relying on `<FormFields>`.

```tsx
<Field title="Email address" message={emailError}>
  <TextInput name="email" value={email} onValue={setEmail} required />
</Field>
```

`<FormField name="…">` combines `<Field>` with `useField()` and `<SchemaInput>` in one step — it reads the schema, current value, and error state from the surrounding `FormContext` automatically.

### Typed input components

Each input is a standalone, controlled component. All extend `ValueInputProps<O>`:

| Prop | Contract |
|---|---|
| `name` | HTML field name |
| `value` | Current value |
| `onValue(v)` | Called on every change |
| `required` | Marks the field as required |
| `disabled` | Disables the control |
| `message` | Inline error string |

The typed inputs are: `TextInput`, `NumberInput`, `DateInput`, `CheckboxInput`, `RadioInput`, `SelectInput`, `FileInput`, `ArrayInput`, `DictionaryInput`, and `DataInput`. `ArrayInput` and `DictionaryInput` both accept an `items` schema to render a repeatable list of sub-inputs with add/remove buttons.

### `SchemaInput` / `DataInput` — schema-driven rendering

`SchemaInput` inspects a `Schema` instance and renders the right input automatically:

| Schema type | Rendered as |
|---|---|
| `StringSchema` | `<TextInput>` |
| `NumberSchema` | `<NumberInput>` (formatted on blur) |
| `DateSchema` | `<DateInput>` |
| `BooleanSchema` | `<CheckboxInput>` |
| `ChoiceSchema` (≤ 8 options) | `<ChoiceRadioInputs>` |
| `ChoiceSchema` (> 8 options) | `<SelectInput>` |
| `ArraySchema` | `<ArrayInput>` |
| `DictionarySchema` | `<DictionaryInput>` |
| `DataSchema` | `<DataInput>` |

`DataInput` renders a row of `SchemaInput` elements for each property of a nested data object, and propagates sub-field errors from a `"key: message\n…"` formatted `message` string.

### `<Button>`, `<SubmitButton>`, `<Clickable>`

`<Clickable>` renders a `<button>` or an `<a>` depending on whether `onClick` or `href` is provided. It tracks its own busy state and shows a loading spinner when its `onClick` promise is pending. `<Button>` is `<Clickable>` with styling variants (`strong`, `plain`, `outline`, `small`, `primary`, `danger`, `success`, …). `<SubmitButton>` reads the surrounding `FormContext`, disables itself while the form is busy, and defaults to a "Save →" label.

### Popovers and combo inputs

`<Popover>` is a layout primitive: its first child is the trigger, subsequent children appear in a floating panel when `open` is true. `<ButtonPopover>` wraps a `<Button>` trigger; `<ButtonInputPopover>` wraps a `<ButtonInput>` trigger styled to look like an input field. Use these to build date-pickers, tag selectors, and other inputs that need a dropdown panel.

`<QueryInput>` is a ready-made combo box: it renders a schema-driven text input and calls an async `onQuery` callback on each keystroke (debounced), showing results as a radio list in a popover.

### Notices and error surfacing

When an `onSubmit` callback returns a non-empty `ReactNode`, `<Form>` dispatches it as a success notice. When it throws a **string**, the string is parsed into field messages — any line matching `"fieldName: message"` maps to that field's error display; an unmatched remainder appears as the form-wide message shown by `<FormMessage>`. Non-string throws become global error notices.

`<FormMessage>` renders the top-level `""` message inline as a `<Message>`. `<FormNotice>` renders it as a larger `<Notice>` block. `<FormNotify>` (no JSX output) forwards the message to the global notice system via a side effect instead.

## Canonical end-to-end example

```tsx
import { Form, Field, TextInput, NumberInput, CheckboxInput, SubmitButton, FormMessage } from "shelving/ui";
import { DATA, StringSchema, NumberSchema, BOOLEAN } from "shelving/schema";

const LISTING_SCHEMA = DATA({
  title:     new StringSchema({ title: "Title", min: 1, max: 80 }),
  price:     new NumberSchema({ title: "Price", min: 0 }),
  published: BOOLEAN,
});

export function ListingForm({ listing }: { listing?: typeof LISTING_SCHEMA.type }) {
  return (
    <Form
      schema={LISTING_SCHEMA}
      data={listing}
      submit={listing ? "Save changes" : "Publish listing"}
      onSubmit={async data => {
        await saveListing(data);
        return listing ? "Listing updated" : "Listing published";
      }}
    />
  );
}
```

The default `<Form>` children (`<FormFields>` + `<FormFooter>`) handle layout automatically. Customise by providing explicit children when you need control over field order, groupings, or extra buttons:

```tsx
<Form schema={LISTING_SCHEMA} data={listing} onSubmit={handleSubmit}>
  <Field title="Title" required>
    <FormInput name="title" />
  </Field>
  <Field title="Price">
    <FormInput name="price" />
  </Field>
  <FormInput name="published" />
  <footer>
    <SubmitButton>Save changes</SubmitButton>
    <Button plain onClick={onCancel}>Cancel</Button>
    <FormMessage />
  </footer>
</Form>
```

`<FormInput name="…">` uses `useField()` to pull the current value, error, and schema from context, then delegates to `<SchemaInput>` — so each field automatically renders the correct control type.

## See also

- [schema](/schema) — `DataSchema`, `StringSchema`, `NumberSchema`, `ChoiceSchema`, and other schema types that drive automatic input selection.
- [ui/form/FormStore](/ui/form/FormStore) — the state class underlying every form.
- [ui/form/SchemaInput](/ui/form/SchemaInput) — the schema-to-input dispatch component.
- [ui](/ui) — top-level UI module index.
- [react](/react) — `useStore`, `useInstance`, and other hooks used internally.
