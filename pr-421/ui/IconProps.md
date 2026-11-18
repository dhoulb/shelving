# IconProps

- Kind: interface
- Import: `import { IconProps } from "shelving/ui";`
- Extends: `ColorVariants`

Props for `<Icon>` — the `status` to represent and optional icon `size`.

## Signatures

```ts
{
	icon?: ComponentType<{ className?: string | undefined }>;
	size?: SizeVariant | undefined;
	tint?: TintVariant | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `icon` | `ComponentType<{ className?: string \| undefined }>` | Set the icon to use. Defaults to appropriate icon for `status` Optional. |
| `size` | `SizeVariant \| undefined` | Size of the icon. Defaults to `var(--size-icon)`. |
| `tint` | `TintVariant \| undefined` | Tint of the selected color. Defaults to `"50"`. |
