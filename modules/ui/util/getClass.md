# getClass

Joins any mix of class inputs into a single `className` string. These two helpers (`getClass` and `getModuleClass`) appear in almost every component in the library — every component that accepts variant props (`small`, `primary`, `plain`, etc.) uses them to build its `className`.

**Things to know:**

- `getClass(...classes)` accepts strings, `null` / `undefined` (ignored), nested arrays, and `Variants` objects. A `Variants` object is a plain boolean dictionary: keys whose value is strictly `true` are included, all others ignored — so you can pass component `props` straight through and boolean variant flags are picked up automatically.
- `getModuleClass(module, ...classes)` does the same but maps each resolved class through a CSS module dictionary, yielding only the hashed names that exist in the module. If `module` is a string (the environment doesn't process `.module.css` files) it returns `undefined` silently, so components degrade gracefully.
- The `Classes` type describes every accepted input form: `string | null | undefined | Classes[] | Variants`.

## Usage

```ts
import { getClass } from "shelving/ui";

getClass("button", null, { primary: true, small: false });
// → "button primary"

getClass("box", ["a", "b"]);
// → "box a b"
```

```ts
import { getModuleClass } from "shelving/ui";
import BUTTON_CSS from "./Button.module.css";

// Pass the base class name then the whole props object.
getModuleClass(BUTTON_CSS, "button", variants);
// → hashed class string containing "button" plus any matching true-valued variant keys
```

The canonical component pattern combines both:

```tsx
import { getClass, getModuleClass } from "shelving/ui";
import BUTTON_CSS from "./Button.module.css";

export function Button({ children, ...variants }: ButtonProps): ReactElement {
  return (
    <button
      className={getClass(
        BLOCK_CLASS, //
        getModuleClass(BUTTON_CSS, "button", variants),
      )}
    >
      {children}
    </button>
  );
}
```

## See also

- [`requireContext`](/ui/requireContext) — the other helper at the heart of the component layer.
- [`ui`](/ui) — the styling system: tint ladder, cascade layers, and theming.
