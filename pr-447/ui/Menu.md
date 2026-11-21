# Menu

- Kind: component
- Import: `import { Menu } from "shelving/ui";`

A `<menu>` list of `<MenuItem>` children.
- Renders as a bare `<menu>` element — semantically equivalent to `<ul>` per HTML spec but more meaningful for menu contexts. Place inside a `<nav>` (or use the sidebar-style nav at the layout level) if a navigation landmark is needed.
- Nested `<Menu>` instances (typically inside a `<MenuItem>`) get indented via the `.menu .menu` CSS rule.
- Pass `small` to make every item smaller, for example in a dense sidebar.

A `<menu>` list of `<MenuItem>` children — the container for URL-aware navigation in sidebars, dropdowns, and any other list of links.

**Things to know:**

- Renders as a bare `<menu>` element (semantically equivalent to `<ul>` but more meaningful for menus). Place it inside a `<nav>` — or a `<SidebarLayout>` sidebar, which is already a `<nav>` landmark — if a navigation landmark is needed.
- Nesting a `<Menu>` inside a `<MenuItem>` gets indented automatically via the `.menu .menu` descendant rule.
- Pass `small` to make every item inside it small, including items in nested menus. See `<MenuItem>`.

## Usage

```tsx live
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
</Menu>;
```

## Styling

Override these hooks at `:root`. The tint hooks (`--menu-color`, `--menu-nested-border`, `--menu-hover-background`, `--menu-hover-color`, `--menu-proud`, `--menu-selected-background`, `--menu-selected-color`, `--menu-active-background`, `--menu-active-color`) are declared again in every tint scope, so override them at `:root, .tint`.

| Variable               | Styles                                                                                             | Default                |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| `--menu-gap`           | Vertical gap between items                                                                         | `0`                    |
| `--menu-font`          | Font family                                                                                        | `var(--font-body)`     |
| `--menu-size`          | Font size                                                                                          | `var(--size-normal)`   |
| `--menu-leading`       | Line height                                                                                        | `var(--leading-auto)`  |
| `--menu-color`         | Text colour                                                                                        | `var(--tint-00)`       |
| `--menu-nested-space`  | Block margin around a nested submenu                                                               | `var(--space-xxsmall)` |
| `--menu-padding`       | Item link top and bottom padding (one length)                                                      | `var(--space-small)`   |
| `--menu-indent`        | Item link left and right padding (one length; with `--menu-stroke`, also insets the nested border) | `var(--space-small)`   |
| `--menu-small-indent`  | Small item link left and right padding (one length; also insets the nested border of a small item) | `var(--space-xsmall)`  |
| `--menu-nested-stroke` | Nested submenu left-border width                                                                   | `var(--stroke-focus)`  |
| `--menu-nested-border` | Nested submenu left-border colour                                                                  | `var(--tint-50)`       |
| `--menu-nested-indent` | Nested submenu left padding                                                                        | `var(--space-xsmall)`  |

Item-size and item-state hooks (`--menu-stroke`, `--menu-icon-size`, `--menu-small-*`, `--menu-hover-*`, `--menu-proud-*`, `--menu-active-*`, `--menu-radius`, `--menu-focus-border`) are documented on `<MenuItem>`.

**Global tokens it reads** — the tint ladder `--tint-00` / `--tint-50`, plus `--space-xxsmall` / `--space-xsmall` / `--space-small`, `--stroke-normal`, `--font-body`, `--size-normal`, `--leading-auto`, and `--stroke-focus`.


## Signatures

```ts
Menu({ children, small, className, ...props }: MenuProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `MenuProps` |  |
| `.small` | `boolean \| undefined` | Make every item in the menu (and in any nested menu) small, as if each `<MenuItem>` had `small`. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
