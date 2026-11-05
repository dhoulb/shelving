# MenuItem

- Kind: component
- Import: `import { MenuItem } from "shelving/ui";`

A `<li>` containing an `<a>` link, plus optional submenu content shown when this item is "proud".
- Reads the current page URL from `<Meta>` and computes `active` / `proud` against its own `href`.
- Splits `children` into `[label, ...after]`: label goes inside the `<a>`; `after` is rendered as siblings below it, only when proud.
- As tall as a `<Button>` by default, so it is easy to tap. Pass `small` for a denser item.

A single `<li>` link entry inside a `<Menu>`. It reads the current page URL from the `Meta` context and automatically marks itself `active` (exact match) or `proud` (an ancestor of the current page) — and when proud, reveals its submenu children.

**Things to know:**

- The first child is the link label (rendered inside the `<a>`). Any additional children form the submenu and are rendered only when the item is proud (the current URL starts with the item's `href`). Wrap that submenu in a nested `<Menu>` to get the `.menu .menu` indentation.
- It forwards all `ClickableProps` — `href`, `onClick`, `disabled`, and so on — to the underlying `<Clickable>`.
- `active` and `proud` are computed against the URL from `<Router>` / `<Navigation>` context.
- By default an item is as tall as a `<Button>` or an `<Input>`, so it is easy to tap. Pass `small` for a denser item (the size before this change). Pass `small` to `<Menu>` to make all of its items small.

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

### Small items

```tsx
import { Menu, MenuItem } from "shelving/ui";

// One small item.
<Menu>
  <MenuItem href="/help" small>Help</MenuItem>
</Menu>

// Every item small, including nested menus.
<Menu small>
  <MenuItem href="/users">Users</MenuItem>
  <MenuItem href="/settings">Settings</MenuItem>
</Menu>
```

## Styling

The item link's hooks (defined in `Menu.module.css`):

| Variable | Styles | Default |
|---|---|---|
| `--menu-padding` | Link top and bottom padding (one length) | `var(--space-small)` |
| `--menu-indent` | Link left and right padding (one length) | `var(--space-small)` |
| `--menu-stroke` | Link transparent border width (one length) | `var(--stroke-normal)` |
| `--menu-icon-size` | Content height used for the minimum height (one length) | `var(--size-icon)` |
| `--menu-height` | Link minimum height | `--menu-icon-size` + 2 × `--menu-padding` + 2 × `--menu-stroke`, the same as `--button-height` |
| `--menu-small-padding` | Small link top and bottom padding (one length) | `var(--space-xsmall)` |
| `--menu-small-indent` | Small link left and right padding (one length) | `var(--space-xsmall)` |
| `--menu-small-height` | Small link minimum height | `0` |
| `--menu-radius` | Link corner radius | `var(--radius-xsmall)` |
| `--menu-focus-border` | Focus outline | `var(--stroke-focus) solid var(--color-focus)` |
| `--menu-hover-background` | Link fill on hover/focus | `var(--tint-90)` |
| `--menu-hover-color` | Link text colour on hover/focus | `var(--tint-00)` |
| `--menu-proud-background` | Fill when proud (ancestor of current page) | `transparent` |
| `--menu-proud` | Text colour when proud | `var(--tint-00)` |
| `--menu-proud-weight` | Font weight when proud | `var(--weight-strong)` |
| `--menu-active-background` | Fill when active (current page), also while hovered or focused | `var(--tint-100)` |
| `--menu-active-color` | Text colour when active | `var(--tint-00)` |
| `--menu-active-weight` | Font weight when active | `var(--weight-strong)` |

List-level hooks (`--menu-gap`, `--menu-color`, the nested-submenu hooks, etc.) are documented on `<Menu>`.

**Global tokens it reads** — the tint ladder `--tint-00` / `--tint-90` / `--tint-100`, plus `--space-small`, `--space-xsmall`, `--size-icon`, `--radius-xsmall`, `--stroke-normal`, `--stroke-focus`, `--color-focus`, and `--weight-strong`.


## Signatures

```ts
MenuItem({ href, children, small, className, ...props }: MenuItemProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `MenuItemProps` |  |
| `.children` | `ReactNode \| readonly [ReactNode, ...ReactNode[]]` | The first child becomes the link label (rendered inside the `<a>`). - Any additional children form the submenu — only rendered when this item is "proud" (an ancestor of the current page). The caller is responsible for wrapping the submenu in a nested `<Menu>` if it wants the CSS `.menu .menu` descendant rules to apply. Read only. |
| `.small` | `boolean \| undefined` | Make the item smaller: less padding and no minimum height. By default an item is as tall as a `<Button>`, so it is easy to tap. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
