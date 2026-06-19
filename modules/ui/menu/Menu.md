# Menu

A `<menu>` list of [`<MenuItem>`](/ui/MenuItem) children — the container for URL-aware navigation in sidebars, dropdowns, and any other list of links.

**Things to know:**

- Renders as a bare `<menu>` element (semantically equivalent to `<ul>` but more meaningful for menus). Place it inside a `<nav>` — or a [`<SidebarLayout>`](/ui/SidebarLayout) sidebar, which is already a `<nav>` landmark — if a navigation landmark is needed.
- Nesting a `<Menu>` inside a [`<MenuItem>`](/ui/MenuItem) gets indented automatically via the `.menu .menu` descendant rule.

## Usage

```tsx
import { Menu, MenuItem } from "shelving/ui";

<Menu>
  <MenuItem href="/dashboard">Dashboard</MenuItem>
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

| Variable | Styles | Default |
|---|---|---|
| `--menu-gap` | Vertical gap between items | `var(--space-xxsmall)` |
| `--menu-font` | Font family | `var(--font-body)` |
| `--menu-size` | Font size | `var(--size-normal)` |
| `--menu-leading` | Line height | `var(--leading)` |
| `--menu-color` | Text colour | `var(--tint-00)` |
| `--menu-nested-space` | Block margin around a nested submenu | `var(--space-xxsmall)` |
| `--menu-padding` | Item link padding (also insets the nested border) | `var(--space-xxsmall)` |
| `--menu-nested-border` | Nested submenu left-border width | `var(--stroke-focus)` |
| `--menu-nested-color-border` | Nested submenu left-border colour | `var(--tint-50)` |
| `--menu-nested-indent` | Nested submenu left padding | `var(--space-xsmall)` |

Item-state hooks (`--menu-hover-*`, `--menu-proud-*`, `--menu-active-*`, `--menu-radius`, `--menu-focus-border`) are documented on [`<MenuItem>`](/ui/MenuItem).

**Global tokens it reads** — the tint ladder [`--tint-00`](/ui/TINT_CLASS) / [`--tint-50`](/ui/TINT_CLASS), plus [`--space-xxsmall`](/ui/getSpaceClass) / [`--space-xsmall`](/ui/getSpaceClass), [`--font-body`](/ui/getFontClass), [`--size-normal`](/ui/getSizeClass), [`--leading`](/ui/getSizeClass), and [`--stroke-focus`](/ui/getStrokeClass).
