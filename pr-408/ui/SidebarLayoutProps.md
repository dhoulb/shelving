# SidebarLayoutProps

- Kind: interface
- Import: `import { SidebarLayoutProps } from "shelving/ui";`
- Extends: `OptionalChildProps`

Props for `<SidebarLayout>` — the `sidebar` column content, main `children`, and a `right` placement flag.

## Signatures

```ts
{
	sidebar: ReactNode;
	right?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `sidebar` | `ReactNode` | Content rendered in the fixed-width side column. |
| `right` | `boolean \| undefined` | Render the sidebar on the right rather than the left. Optional. |
