# MenuItem

A single `<li>` link entry inside a [`<Menu>`](/ui/Menu). It reads the current page URL from the [`Meta`](/ui/Meta) context and automatically marks itself `active` (exact match) or `proud` (an ancestor of the current page) — and when proud, reveals its submenu children.

**Things to know:**

- The first child is the link label (rendered inside the `<a>`). Any additional children form the submenu and are rendered only when the item is proud (the current URL starts with the item's `href`). Wrap that submenu in a nested [`<Menu>`](/ui/Menu) to get the `.menu .menu` indentation.
- It forwards all [`ClickableProps`](/ui/ClickableProps) — `href`, `onClick`, `disabled`, and so on — to the underlying [`<Clickable>`](/ui/Clickable).
- `active` and `proud` are computed against the URL from [`<Router>`](/ui/Router) / [`<Navigation>`](/ui/Navigation) context.

## Usage

```tsx
import { Menu, MenuItem } from "shelving/ui";

<Menu>
  <MenuItem href="/users">
    Users
    <Menu>
      <MenuItem href="/users/active">Active</MenuItem>
      <MenuItem href="/users/archived">Archived</MenuItem>
    </Menu>
  </MenuItem>
  <MenuItem href="/settings">Settings</MenuItem>
</Menu>
```

## Styling

The item link's hooks (defined in `Menu.module.css`):

| Variable | Styles | Default |
|---|---|---|
| `--menu-padding` | Link inner padding | `var(--space-xxsmall)` |
| `--menu-radius` | Link corner radius | `var(--radius-xxsmall)` |
| `--menu-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |
| `--menu-hover-background` | Link fill on hover/focus | `var(--tint-90)` |
| `--menu-hover-color` | Link text colour on hover/focus | `var(--tint-00)` |
| `--menu-proud-background` | Fill when proud (ancestor of current page) | `transparent` |
| `--menu-proud` | Text colour when proud | `var(--tint-00)` |
| `--menu-proud-weight` | Font weight when proud | `var(--weight-strong)` |
| `--menu-active-background` | Fill when active (current page) | `var(--tint-100)` |
| `--menu-active-color` | Text colour when active | `var(--tint-00)` |
| `--menu-active-weight` | Font weight when active | `var(--weight-strong)` |

List-level hooks (`--menu-gap`, `--menu-color`, the nested-submenu hooks, etc.) are documented on [`<Menu>`](/ui/Menu).

**Global tokens it reads** — the tint ladder [`--tint-00`](/ui/TINT_CLASS) / [`--tint-90`](/ui/TINT_CLASS) / [`--tint-100`](/ui/TINT_CLASS), plus [`--space-xxsmall`](/ui/getSpaceClass), [`--radius-xxsmall`](/ui/getRadiusClass), [`--stroke-focus`](/ui/getStrokeClass), [`--stroke-normal`](/ui/getStrokeClass), [`--color-focus`](/ui/getColorClass), and [`--weight-strong`](/ui/getWeightClass).
