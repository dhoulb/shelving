# MenuItemProps

- Kind: interface
- Import: `import { MenuItemProps } from "shelving/ui";`
- Extends: `ClickableProps`

Props for `<MenuItem>` — `<Clickable>` props plus `children` whose first node is the label and the rest the submenu.

## Signatures

```ts
{
	readonly children: ReactNode | readonly [ReactNode, ...ReactNode[]];
	readonly small?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode \| readonly [ReactNode, ...ReactNode[]]` | The first child becomes the link label (rendered inside the `<a>`). - Any additional children form the submenu — only rendered when this item is "proud" (an ancestor of the current page). The caller is responsible for wrapping the submenu in a nested `<Menu>` if it wants the CSS `.menu .menu` descendant rules to apply. Read only. |
| `small` | `boolean \| undefined` | Make the item smaller: less padding and no minimum height. By default an item is as tall as a `<Button>`, so it is easy to tap. Read only. Optional. |
