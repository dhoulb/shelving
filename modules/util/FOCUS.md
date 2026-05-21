# Focus helpers

Browser utility for locating the first focusable element inside a DOM subtree. Useful when you need to programmatically move keyboard focus into a dialog, panel, or other container after it becomes visible.

## Usage

### Moving focus into a container

```ts
import { getFirstFocusable } from "shelving/util";

const dialog = document.getElementById("my-dialog")!;
const target = getFirstFocusable(dialog);
target?.focus();
```

The search considers links, enabled buttons, enabled inputs, selects, textareas, and any element with a non-negative `tabindex`. The element itself is checked first before querying its descendants.
