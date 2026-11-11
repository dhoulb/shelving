# PlaygroundCode

- Kind: interface
- Import: `import { PlaygroundCode } from "shelving/ui";`

Code and CSS that the playground frame runs.

## Signatures

```ts
{
	readonly code?: string | undefined;
	readonly css?: string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `code` | `string \| undefined` | TSX source to run. It can import from `shelving/*`, `react`, and `react-dom` only. Read only. Optional. |
| `css` | `string \| undefined` | CSS to add after the shelving styles. Read only. Optional. |
