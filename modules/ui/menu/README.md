# Menu

A `<menu>` list with URL-aware items. `<Menu>` and `<MenuItem>` are the building blocks for navigation in sidebars, dropdowns, and any other list of links.

`<MenuItem>` reads the current page URL from the `Meta` context and automatically marks itself `active` (exact match) or `proud` (ancestor of the current page). When proud, it reveals its submenu children.

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

The first child of `<MenuItem>` is the link label. Any additional children form the submenu and are only rendered when the item is proud (i.e. when the current URL starts with the item's `href`). Nesting a `<Menu>` inside applies the `.menu .menu` indentation rule automatically.

`<MenuItem>` forwards all `ClickableProps` — `href`, `onClick`, `disabled`, and so on.

## See also

- [`layout`](/ui/layout) — `<SidebarLayout>` renders a `<nav>` that typically contains a `<Menu>`
- [`router`](/ui/router) — provides the URL context `<MenuItem>` reads
- [`form`](/ui/form) — `<Clickable>` and `<Button>` used as the link primitive inside `<MenuItem>`
