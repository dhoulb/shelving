# NoticeProps

- Kind: interface
- Import: `import { NoticeProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `<Notice>` — flex/colour/status styling variants, optional `children`, and an optional `icon`.

## Signatures

```ts
{
	icon?: ReactElement | false | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `icon` | `ReactElement \| false \| undefined` | Icon for the notice (or `null` or `false` to hide the icon, defaults to `<StatusIcon>`). Optional. |
