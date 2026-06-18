# ChoiceSchema

Validates that a value is one of a known set of options — designed to power a `<select>` field in HTML. The validated type is the union of the option keys.

[`CHOICE`](/schema/CHOICE) is the sugar factory that builds a `ChoiceSchema` from either an array of strings (keys and labels are the same) or an object (keys are the validated values, object values are display labels).

## Usage

```ts
import { CHOICE } from "shelving/schema";

// Array form — keys and labels are the same.
const STATUS = CHOICE(["draft", "published", "archived"] as const);
STATUS.validate("published"); // "published"
STATUS.validate("deleted");   // throws "Unknown value"

// Object form — keys are validated values, object values are display labels.
const Priority = CHOICE({ low: "Low priority", high: "High priority" });
```

`ChoiceSchema` is iterable and exposes `.keys()` and `.entries()` for building select menus. It does not implicitly default to the first option; pass `value` if you want a preselected choice.

## See also

- [`shelving/schema`](/schema) — overview of schema concepts and composition.
