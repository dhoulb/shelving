# NumberSchemaOptions

- Kind: interface
- Import: `import { NumberSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Allowed options for `NumberSchema`.

## Signatures

```ts
{
	readonly value?: number | undefined;
	readonly min?: number | undefined;
	readonly max?: number | undefined;
	readonly step?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `number \| undefined` | Default number value used when the input is `undefined`. Read only. Optional. |
| `min` | `number \| undefined` | Minimum allowed value. Read only. Defaults to `Number.NEGATIVE_INFINITY`. |
| `max` | `number \| undefined` | Maximum allowed value. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `step` | `number \| undefined` | Rounding step the value is snapped to (e.g. `1` for integers). Read only. Optional. |
