# SchemaInput

- Kind: component
- Import: `import { SchemaInput } from "shelving/ui";`

Show the appropriate input control for a schema, dispatching on the schema's concrete type.
- Picks `DateInput`, `NumberInput`, choice radios/select, `CheckboxInput`, `TextInput` or `TextareaInput`, `ArrayInput`, `DictionaryInput`, or `DataInput`.
- `required` defaults to whether the schema is required.

Schema-driven input dispatch. `SchemaInput` inspects a `Schema` instance and renders the right control automatically — the same mechanism `<Form>` uses to turn a `DataSchema` into a complete set of inputs.

**Things to know:**

- `required` defaults to whether the schema is required (i.e. not wrapped in an `OptionalSchema` or `NullableSchema`); override it explicitly when needed.
- It throws an `UnexpectedError` if no input matches the schema type.
- `SchemaField` wraps the chosen input in a `<Field>` with its label and message; pass `children` to override the input while keeping the field chrome.
- Every input it dispatches to is a standalone, controlled component extending `ValueInputProps<O>` — see the prop contract below.

The schema-to-input mapping:

| Schema type                                                     | Rendered as                         |
| --------------------------------------------------------------- | ----------------------------------- |
| `StringSchema`                                                  | `<TextInput>`                       |
| `NumberSchema`                                                  | `<NumberInput>` (formatted on blur) |
| `DateSchema`                                                    | `<DateInput>`                       |
| `BooleanSchema`                                                 | `<CheckboxInput>`                   |
| `ChoiceSchema` (`input: "radio"`, the default for ≤ 8 options)  | `<ChoiceRadioInputs>`               |
| `ChoiceSchema` (`input: "select"`, the default for > 8 options) | `<SelectInput>`                     |
| `ArraySchema`                                                   | `<ArrayInput>`                      |
| `DictionarySchema`                                              | `<DictionaryInput>`                 |
| `DataSchema`                                                    | `<DataInput>`                       |

The shared value-input prop contract (`ValueInputProps<O>`):

| Prop         | Contract                    |
| ------------ | --------------------------- |
| `name`       | HTML field name             |
| `value`      | Current value               |
| `onValue(v)` | Called on every change      |
| `required`   | Marks the field as required |
| `disabled`   | Disables the control        |
| `message`    | Inline error string         |

`<DataInput>` renders a row of `SchemaInput` elements for each property of a nested data object, and propagates sub-field errors from a `"key: message\n…"` formatted `message` string. `ArrayInput` and `DictionaryInput` both accept an `items` schema to render a repeatable list of sub-inputs with add/remove buttons.

## Usage

### Every input

`<Form>` renders a `SchemaInput` for each property of its schema, so one form shows each type of input.

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

### Dispatch on a single schema

```tsx live
import { SchemaInput } from "shelving/ui";
import { StringSchema, NumberSchema } from "shelving/schema";

<SchemaInput name="email" schema={new StringSchema({ title: "Email" })} /> // -> <TextInput>
<SchemaInput name="age" schema={new NumberSchema({ title: "Age" })} /> // -> <NumberInput>
```

### Wrapped in a field

```tsx
import { SchemaField } from "shelving/ui";

<SchemaField name="email" schema={EMAIL_SCHEMA} />; // <Field> wrapping a <TextInput>
```


## Signatures

```ts
SchemaInput(props: SchemaInputProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `SchemaInputProps<T>` |  |
| `.schema` | `T` |  |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | The matching input element for the schema. |

## Throws

| Type | Description |
| --- | --- |
| `unknown` | `UnexpectedError` if no input matches the schema type. |
