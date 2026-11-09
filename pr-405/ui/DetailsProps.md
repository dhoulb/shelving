# DetailsProps

- Kind: interface
- Import: `import { DetailsProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `<Details>` — the summary title, the revealed content, and the open state.

## Signatures

```ts
{
	title: ReactNode;
	open?: boolean | undefined;
	name?: string | undefined;
	children: ReactNode;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `title` | `ReactNode` | Content of the always-visible summary (e.g. a question). |
| `open` | `boolean \| undefined` | Whether the panel starts expanded. Optional. |
| `name` | `string \| undefined` | Shared group name — panels with the same `name` open exclusively (only one at a time). Optional. |
| `children` | `ReactNode` | Content revealed when the panel is expanded. |
