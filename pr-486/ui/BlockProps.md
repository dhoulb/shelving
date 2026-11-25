# BlockProps

- Kind: interface
- Import: `import { BlockProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `Block` — colour, space, typography, and width variants plus an optional `as` element override.

## Signatures

```ts
{
	as?: BlockElement | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `as` | `BlockElement \| undefined` | Element this `<Block>` renders as, e.g. "header" to output a "<header>" Defaults to `"div"`. |
