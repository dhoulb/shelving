# FormatOptions

- Kind: interface
- Import: `import { FormatOptions } from "shelving/util/format";`

Options that are shared across all formatters.

## Signatures

```ts
{
	readonly locale?: Intl.Locale | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `locale` | `Intl.Locale \| undefined` | Override the locale for formatting (defaults to detected locale). Read only. Optional. |
