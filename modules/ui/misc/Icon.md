# Icon

Renders an icon for a given status, coloured to match. Picks a heroicon per status (`success`, `error`, `warning`, etc.) and uses the animated `<Loading>` spinner for `"loading"`.

**Things to know:**

- `status` defaults to `"info"` (an info icon) when unset.
- Size it via the `size` prop (`"small"`, `"normal"`, `"large"`, `"xlarge"`, or `"xxlarge"`); defaults to the current line height.
- Paints from its status tint by default, so the icon colour matches the `status` — override `--icon-color` to force a specific colour.

## Usage

```tsx
import { Icon } from "shelving/ui";

<Icon status="success" size="large" />
<Icon status="error" />
<Icon status="loading" size="small" />
```

## Styling

| Variable | Styles | Default |
|---|---|---|
| `--icon-color` | Icon colour | `var(--tint-50)` (the status tint, e.g. `--color-failure` for `status="error"`) |
| `--icon-size` | Icon width / height | `1lh` (current line height) |

**Global tokens it reads** — the status tint anchor `--tint-50`, plus the size tokens `--size-small` / `--size-normal` / `--size-large` / `--size-xlarge` / `--size-xxlarge` used by the `size` prop.
