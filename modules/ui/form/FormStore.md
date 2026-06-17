# FormStore

The reactive brain behind every form. `FormStore` extends [`DataStore`](/store/DataStore) from [store](/store) and owns the current (partial) field values, a `messages` dictionary of per-field errors, and the validate/submit helpers that drive a [`Form`](/ui/Form).

**Things to know:**

- It holds the current (possibly partial and invalid) field values plus a `messages` dictionary — error strings keyed by field name, with a top-level `""` key for form-wide messages.
- `validated` is a getter that runs the schema and returns fully-typed data or throws a string on failure.
- `publish(name, value)` validates a single field, writes the result, and stores any per-field error (it persists the raw value even when invalid, so nothing is lost on the way to submit).
- `submit(callback)` validates the whole form and, if valid, runs the callback.
- Assigning a string to `reason` splits it into per-field messages (using the `"fieldName: message"` line format from [schema](/schema)) instead of recording a global failure; any non-string reason is surfaced as-is.
- You rarely construct `FormStore` directly — [`Form`](/ui/Form) does it for you — but you can grab it from context with [`requireForm()`](/ui/requireForm) when you need it.

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

## See also

- [`Form`](/ui/Form) — the component that creates and provides a `FormStore`.
- [`Field`](/ui/Field) — renders a single field's value and message from the store.
- [store](/store) — [`DataStore`](/store/DataStore) and the reactive store family `FormStore` builds on.
- [schema](/schema) — schema validation and the `"fieldName: message"` split format.
- [react](/react) — [`useStore`](/react/useStore), [`useInstance`](/react/useInstance), and other hooks used to subscribe to the store.
