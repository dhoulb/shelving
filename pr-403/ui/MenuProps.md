# MenuProps

- Kind: interface
- Import: `import { MenuProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `<Menu>` — optional `<MenuItem>` `children`.

## Signatures

```ts
{
	readonly small?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `small` | `boolean \| undefined` | Make every item in the menu (and in any nested menu) small, as if each `<MenuItem>` had `small`. Read only. Optional. |
