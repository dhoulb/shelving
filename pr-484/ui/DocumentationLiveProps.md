# DocumentationLiveProps

- Kind: interface
- Import: `import { DocumentationLiveProps } from "shelving/ui";`

Props for `<DocumentationLive>` — the code to show and run, plus an optional title.

## Signatures

```ts
{
	code: string;
	title?: string | undefined;
	desktop?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `code` | `string` | TSX source to show and run. It can import from `shelving/*`, `react`, and `react-dom` only. |
| `title` | `string \| undefined` | Title of the example, used as the accessible title of the preview frame. Optional. |
| `desktop` | `boolean \| undefined` | Show the preview in a full-width browser window under the code, not on a phone. Use it for a wide preview, such as a sidebar layout or a big table. Optional. |
