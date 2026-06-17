# StatusIcon

Renders the icon for a given status, coloured to match. Picks a heroicon per status (`success`, `error`, `warning`, etc.) and uses the animated [`<Loading>`](/ui/Loading) spinner for `"loading"`.

**Things to know:**

- `status` defaults to `"info"` (an info icon) when unset.
- Size it via the `size` prop (`"small"`, `"normal"`, `"large"`, `"xlarge"`, or `"xxlarge"`); defaults to the current line height.
- Has no own styling hooks — it paints from the shared status colours and inherits its size from the surrounding text.

## Usage

```tsx
import { StatusIcon } from "shelving/ui";

<StatusIcon status="success" size="large" />
<StatusIcon status="error" />
<StatusIcon status="loading" size="small" />
```

## See also

- [`Loading`](/ui/Loading) — the spinner used for the `"loading"` status.
- [`Notice`](/ui/Notice) — uses `<StatusIcon>` as its default icon.
- [`Tag`](/ui/Tag) — inline label sharing the same status vocabulary.
