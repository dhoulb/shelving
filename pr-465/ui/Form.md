# Form

- Kind: component
- Import: `import { Form } from "shelving/ui";`

Schema-driven form that creates a `FormStore`, provides it via `FormContext`, and validates/submits on submit.
- Renders its fields, a full-width submit button and the form's message by default, or custom `children` that read the form via hooks.
- Closes a parent `<dialog>` automatically on successful submit.

The entry point for shelving forms. `Form` creates a `FormStore` from a `schema` prop, wraps everything in an HTML `<form>`, disables the whole fieldset while busy, and calls `onSubmit` on a valid submit. Build validated, schema-driven forms from a handful of composable pieces, or drop in a single `<Form>` for a fully automatic experience.

**Things to know:**

- If you provide no `children`, `Form` renders `<FormFields>` (one auto-input per schema property), then a full-width solid `<SubmitButton>` with `space="none"`, then `<FormMessage>`. A usable form is one prop away. The button has no margin of its own, so the gap above it is the last field's margin, the same as the gap between fields. Set `submit={false}` for no default button.
- Pass `data` to pre-populate an edit form. Pass `messages` (a string or dictionary) to seed initial field errors — useful when a server returns validation failures.
- The whole `<fieldset>` is disabled while a submit is in flight, so inputs and buttons lock automatically.
- The `<fieldset>` uses `display: contents`, so it has no box of its own. Child margins merge with the margins outside the form, the same as in any other block. A form does not trim its children.
- A successful submit inside a `<dialog>` closes the dialog automatically, through `requestDialogClose()`, so a `<Dialog>` can animate out.
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

### Try it

```tsx live "A product form"
import { DATA, NumberSchema, StringSchema } from "shelving/schema";
import { Form, Notices } from "shelving/ui";

const PRODUCT_SCHEMA = DATA({
	name: new StringSchema({ title: "Name", min: 1, max: 100 }),
	price: new NumberSchema({ title: "Price", min: 0 }),
});

// Leave the name empty and submit to see the error.
<Form schema={PRODUCT_SCHEMA} submit="Create product" onSubmit={() => "Product created"} />
<Notices />
```

### Every input

```tsx live "Every input"
import { ArraySchema, BooleanSchema, ChoiceSchema, DATA, DateSchema, EmailSchema, NumberSchema, StringSchema } from "shelving/schema";
import { Form, Notices } from "shelving/ui";

const SCHEMA = DATA({
	name: new StringSchema({ title: "Name", min: 1 }),
	email: new EmailSchema({ title: "Email" }),
	bio: new StringSchema({ title: "Bio", multiline: true, rows: 3 }),
	age: new NumberSchema({ title: "Age", min: 0 }),
	birthday: new DateSchema({ title: "Birthday" }),
	newsletter: new BooleanSchema({ title: "Send me the newsletter" }),
	plan: new ChoiceSchema({ title: "Plan", options: { free: "Free", pro: "Pro", team: "Team" } }),
	country: new ChoiceSchema({ title: "Country", input: "select", options: { gb: "United Kingdom", ie: "Ireland", fr: "France", de: "Germany" } }),
	tags: new ArraySchema({ title: "Tags", items: new StringSchema({ min: 1 }) }),
});

<Form schema={SCHEMA} submit="Save" onSubmit={() => "Saved"} />
<Notices />
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

Provide explicit `children` when you need control over field order, groupings, or extra buttons. `<FormInput>` uses `useField()` to pull the current value, error, and schema from context, then delegates to `<SchemaInput>` so each field renders the correct control type.

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
		<Button plain onClick={onCancel}>
			Cancel
		</Button>
		<FormMessage />
	</footer>
</Form>;
```

## Notices and error surfacing

When an `onSubmit` callback returns a non-empty `ReactNode`, `Form` dispatches it as a success notice. When it throws a **string**, the string is parsed into field messages — any line matching `"fieldName: message"` maps to that field's error display; an unmatched remainder appears as the form-wide message shown by `<FormMessage>`. Non-string throws become global error notices. The string-splitting rule comes from `shelving/schema`.

- `<FormMessage>` renders the top-level `""` message inline as a `<Message>`.
- `<FormNotice>` renders it as a larger `<Notice>` block.
- `<FormNotify>` (no JSX output) forwards the message to the global notice system via a side effect instead.

## Styling

`Form` exposes no own hooks. It renders a plain `<form>` styled by the shared block variants from `getBlockClass()`, so it inherits its layout from the standard `space`, `indent`, `padding`, `width`, `color`, and typography variants — set `<Form indent="normal">` to inset the form's content from the edges, or `<Form space="large">` to change its outer block margin.


## Signatures

```ts
Form(props: FormProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `FormProps<T>` |  |
| `.schema` | `DataSchema<T>` | Schema for the form. |
| `.data` | `PartialData<T> \| undefined` | Initial data for the form. Optional. |
| `.submit` | `ReactNode \| false \| undefined` | Content of the default submit button, or `false` for no default submit button. Only used when there are no `children`. Optional. |
| `.onSubmit` | `FormCallback<T> \| undefined` | Optional function called when the form is submitted. Takes the current (validated) value of the form, processes it (possibly asynchronously) and returns any new values to set in the form. Optional. |
| `.messages` | `ImmutableDictionary<string> \| string \| undefined` | Initial set of messages for the form as either a dictionary or a string with `fieldName:` style messages. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | A `<form>` element wrapping the fields in a `FormContext` provider. |
