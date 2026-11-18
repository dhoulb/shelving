# MarkupProps

- Kind: interface
- Import: `import { MarkupProps } from "shelving/ui";`
- Extends: `Partial<MarkupOptions>`

Props for `<Markup>` — extends `MarkupOptions` so callers can override `rules`, `rel`, `url`, `root`, or `schemes` directly.

## Signatures

```ts
{
	children?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `children` | `string \| undefined` | The source string to parse and render. Optional. |
