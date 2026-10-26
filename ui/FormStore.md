# FormStore

- Kind: class
- Import: `import { FormStore } from "shelving/ui";`
- Extends: `DataStore<Partial<T>>`
- Implements: `AsyncDisposable`

Reactive store holding the current (possibly partial and invalid) value of a form, plus its field messages.
- Extends `DataStore` with the form's `schema`, per-field error `messages`, and validate/submit helpers.
- Assigning a string `reason` splits it into per-field messages rather than a global failure.

The reactive brain behind every form. `FormStore` extends `DataStore` from `shelving/store` and owns the current (partial) field values, a `messages` dictionary of per-field errors, and the validate/submit helpers that drive a `<Form>`.

**Things to know:**

- It holds the current (possibly partial and invalid) field values plus a `messages` dictionary — error strings keyed by field name, with a top-level `""` key for form-wide messages.
- `validated` is a getter that runs the schema and returns fully-typed data or throws a string on failure.
- `publish(name, value)` validates a single field, writes the result, and stores any per-field error (it persists the raw value even when invalid, so nothing is lost on the way to submit).
- `submit(callback)` validates the whole form and, if valid, runs the callback.
- Assigning a string to `reason` splits it into per-field messages (using the `"fieldName: message"` line format from `shelving/schema`) instead of recording a global failure; any non-string reason is surfaced as-is.
- You rarely construct `FormStore` directly — `<Form>` does it for you — but you can grab it from context with `requireForm()` when you need it.

## Usage

### Direct construction

```tsx
import { FormStore } from "shelving/ui";
import { DATA, StringSchema } from "shelving/schema";

const USER_SCHEMA = DATA({ name: new StringSchema({ title: "Name", min: 1 }) });

const store = new FormStore(USER_SCHEMA, { name: "Dave" });

store.publish("name", "Dave Houlbrooke"); // Validate + write a single field.
const data = store.validated; // Fully-typed data, or throws a string message.
```

### Reading the store from context

```tsx
import { requireForm } from "shelving/ui";

function ResetButton() {
  const store = requireForm();
  return <Button plain onClick={() => store.set("name", "")}>Clear name</Button>;
}
```


## Signatures

```ts
new FormStore<T>(schema: DataSchema<T>, partialData: Partial<T> = {}, messages?: ImmutableDictionary<string> | string | undefined)
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `schema` | `DataSchema<T>` |  |
| `partialData` | `Partial<T>` | Defaults to `{}`. |
| `messages` | `ImmutableDictionary<string> \| string \| undefined` | Optional. |

## Returns

| Type | Description |
| --- | --- |
| `FormStore<T>` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `id` | `unknown` | Unique ID for the form. Read only. Defaults to `getRandomKey()`. |
| `key` | `string` | Key used for mounting the form Read only. |
| `schema` | `DataSchema<T>` | Schema for the current form. Read only. |
| `messages` | `unknown` | Store named error messages for individual fields. - Throwing a string triggers changes in this. - Rows prefixed with `fieldName:` are shown on those specific fields. - See `splitMessages()` in `shelving` for more information. Read only. Defaults to `new DictionaryStore<string>()`. |
| `validated` | `T` | The current value validated against the schema, also written back to `this.value`. Read only. |

## Methods

- [FormStore.requireSchema()](FormStore/requireSchema.md): Get the Schema for a named field of this form.
- [FormStore.publish()](FormStore/publish.md): Validate and set a value for a named field of this form.
- [FormStore.submit()](FormStore/submit.md): Validate the current form value and run an optional submit callback with it.
