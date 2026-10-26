# DateFormatOptions

- Kind: interface
- Import: `import { DateFormatOptions } from "shelving/util/format";`
- Extends: `Intl.DateTimeFormatOptions`

Options we use for date, time, and datetime formatting.

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
