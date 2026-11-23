# MenuHeading

- Kind: component
- Import: `import { MenuHeading } from "shelving/ui";`

A heading for a `<Menu>`, with the `<Label>` style, indented so its text lines up with the text of each `<MenuItem>`.
- Place it directly above the `<Menu>` it names.
- Pass `small` when the menu below it is small.

A heading for a `<Menu>`. It has the `<Label>` style (small, bold and uppercase), and it is indented so its text lines up with the text of each `<MenuItem>`.

**Things to know:**

- Place it directly above the `<Menu>` it names.
- The indent follows the menu's own hooks (`--menu-stroke` and `--menu-indent`), so it stays in line when you change them.
- Pass `small` when the menu below it is small. It then uses `--menu-small-indent`, the same as a small `<MenuItem>`.
- Takes the same props as `<Label>`. It renders an `<h3>` by default; set `level` to change the element.

## Usage

```tsx live
import { Menu, MenuHeading, MenuItem } from "shelving/ui";

<MenuHeading>Account</MenuHeading>
<Menu>
	<MenuItem href="/profile">Profile</MenuItem>
	<MenuItem href="/billing">Billing</MenuItem>
</Menu>
```

### Small menu

```tsx live
import { Menu, MenuHeading, MenuItem } from "shelving/ui";

<MenuHeading small>Help</MenuHeading>
<Menu small>
	<MenuItem href="/contact">Contact</MenuItem>
	<MenuItem href="/terms">Terms</MenuItem>
</Menu>
```

## Styling

It has no hooks of its own. It reads these `<Menu>` hooks for its left and right padding: `--menu-stroke` plus `--menu-indent`, or `--menu-small-indent` when small. All other styles come from `<Label>`.


## Signatures

```ts
MenuHeading({ small, className, ...props }: MenuHeadingProps): ReactNode
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `MenuHeadingProps` |  |
| `.small` | `boolean \| undefined` | Line up with small items, as in a `<Menu small>`. Read only. Optional. |

## Returns

| Type | Description |
| --- | --- |
| `ReactNode` |  |
