# DateSchemaOptions

- Kind: interface
- Import: `import { DateSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `DateSchema`.

## Signatures

```ts
{
	readonly value?: PossibleDate | undefined;
	readonly min?: Nullish<PossibleDate>;
	readonly max?: Nullish<PossibleDate>;
	readonly input?: DateInputType | undefined;
	readonly step?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `PossibleDate \| undefined` | Default date used when the input is `undefined`. Read only. Optional. |
| `min` | `Nullish<PossibleDate>` | Earliest allowed date (`null` for no bound). Read only. Optional. |
| `max` | `Nullish<PossibleDate>` | Latest allowed date (`null` for no bound). Read only. Optional. |
| `input` | `DateInputType \| undefined` | HTML `<input />` `type=""` hint for downstream UIs. Read only. Defaults to `"date"`. |
| `step` | `number \| undefined` | Rounding step (in milliseconds, because that's the base unit for time). - E.g. `1000 * 60` will round to the nearest minute. - Note: HTML `<input>` `step` attributes are in _seconds_, so you may need to convert units. Read only. Optional. |
