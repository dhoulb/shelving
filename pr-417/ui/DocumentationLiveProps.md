# DocumentationLiveProps

- Kind: interface
- Import: `import { DocumentationLiveProps } from "shelving/ui";`

Props for `<DocumentationLive>` — the code to show and run, plus an optional title.

## Signatures

```ts
{
	code: string;
	title?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `code` | `string` | TSX source to show and run. It can import from `shelving/*`, `react`, and `react-dom` only. |
| `title` | `string \| undefined` | Title of the example, used as the accessible title of the preview frame. Optional. |
