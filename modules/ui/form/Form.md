# Form

The entry point for shelving forms. `Form` creates a [`FormStore`](/ui/FormStore) from a `schema` prop, wraps everything in an HTML `<form>`, disables the whole fieldset while busy, and calls `onSubmit` on a valid submit. Build validated, schema-driven forms from a handful of composable pieces, or drop in a single `<Form>` for a fully automatic experience.

**Things to know:**

- If you provide no `children`, `Form` renders [`<FormFields>`](/ui/FormFields) (one auto-input per schema property) followed by [`<FormFooter>`](/ui/FormFooter) (submit button + error message), so a usable form is one prop away.
- Pass `data` to pre-populate an edit form. Pass `messages` (a string or dictionary) to seed initial field errors — useful when a server returns validation failures.
- The whole `<fieldset>` is disabled while a submit is in flight, so inputs and buttons lock automatically.
- A successful submit inside a `<dialog>` closes the dialog automatically.
- Notices are surfaced from the `onSubmit` return/throw — see [Notices and error surfacing](#notices-and-error-surfacing) below.

## Usage

### Automatic form

With no `children`, `Form` renders one input per schema property plus a footer.

```tsx
import { Form } from "shelving/ui";
import { DATA, StringSchema, NumberSchema } from "shelving/schema";

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

### Edit form with seeded data

```tsx
import { Form } from "shelving/ui";
import { DATA, StringSchema, NumberSchema, BOOLEAN } from "shelving/schema";

const LISTING_SCHEMA = DATA({
  title: new StringSchema({ title: "Title", min: 1, max: 80 }),
  price: new NumberSchema({ title: "Price", min: 0 }),
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

### Custom layout

Provide explicit `children` when you need control over field order, groupings, or extra buttons. [`<FormInput>`](/ui/FormInput) uses [`useField()`](/ui/useField) to pull the current value, error, and schema from context, then delegates to [`SchemaInput`](/ui/SchemaInput) so each field renders the correct control type.

```tsx
import { Form, Field, FormInput, SubmitButton, Button, FormMessage } from "shelving/ui";

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

## Notices and error surfacing

When an `onSubmit` callback returns a non-empty `ReactNode`, `Form` dispatches it as a success notice. When it throws a **string**, the string is parsed into field messages — any line matching `"fieldName: message"` maps to that field's error display; an unmatched remainder appears as the form-wide message shown by [`<FormMessage>`](/ui/FormMessage). Non-string throws become global error notices. The string-splitting rule comes from [`shelving/schema`](/schema).

- `<FormMessage>` renders the top-level `""` message inline as a [`<Message>`](/ui/Message).
- [`<FormNotice>`](/ui/FormNotice) renders it as a larger [`<Notice>`](/ui/Notice) block.
- [`<FormNotify>`](/ui/FormNotify) (no JSX output) forwards the message to the global notice system via a side effect instead.

## Styling

`Form` only lays out its block flow — it exposes a single spacing hook and otherwise inherits styling from the components inside it.

| Variable | Styles | Default |
|---|---|---|
| `--form-space` | Outer block margin (top + bottom) | `var(--space-paragraph)` (16px) |

**Global tokens it reads:** [`--space-paragraph`](/ui/getSpaceClass).
