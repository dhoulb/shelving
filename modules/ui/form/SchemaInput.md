# SchemaInput

Schema-driven input dispatch. `SchemaInput` inspects a `Schema` instance and renders the right control automatically — the same mechanism `<Form>` uses to turn a `DataSchema` into a complete set of inputs.

**Things to know:**

- `required` defaults to whether the schema is required (i.e. not wrapped in an `OptionalSchema` or `NullableSchema`); override it explicitly when needed.
- It throws an `UnexpectedError` if no input matches the schema type.
- `SchemaField` wraps the chosen input in a `<Field>` with its label and message; pass `children` to override the input while keeping the field chrome.
- Every input it dispatches to is a standalone, controlled component extending `ValueInputProps<O>` — see the prop contract below.

The schema-to-input mapping:

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

The shared value-input prop contract (`ValueInputProps<O>`):

| Prop | Contract |
|---|---|
| `name` | HTML field name |
| `value` | Current value |
| `onValue(v)` | Called on every change |
| `required` | Marks the field as required |
| `disabled` | Disables the control |
| `message` | Inline error string |

`<DataInput>` renders a row of `SchemaInput` elements for each property of a nested data object, and propagates sub-field errors from a `"key: message\n…"` formatted `message` string. `ArrayInput` and `DictionaryInput` both accept an `items` schema to render a repeatable list of sub-inputs with add/remove buttons.

## Usage

### Dispatch on a single schema

```tsx
import { SchemaInput } from "shelving/ui";
import { StringSchema, NumberSchema } from "shelving/schema";

<SchemaInput name="email" schema={new StringSchema({ title: "Email" })} /> // -> <TextInput>
<SchemaInput name="age" schema={new NumberSchema({ title: "Age" })} /> // -> <NumberInput>
```

### Wrapped in a field

```tsx
import { SchemaField } from "shelving/ui";

<SchemaField name="email" schema={EMAIL_SCHEMA} /> // <Field> wrapping a <TextInput>
```
