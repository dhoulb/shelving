# LinkProps

- Kind: interface
- Import: `import { LinkProps } from "shelving/ui";`
- Extends: `ClickableProps`

Props for `Link` — `ClickableProps` (`href` for navigation or `onClick` for actions) plus colour and typography variants.

## Signatures

```ts
{
	plain?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `plain` | `boolean \| undefined` | Remove the link colour, weight, and underline, e.g. for a link around a block of content. Optional. |
