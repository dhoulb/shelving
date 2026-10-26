# BooleanSchemaOptions

- Kind: interface
- Import: `import { BooleanSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Allowed options for `BooleanSchema`.

## Signatures

```ts
{
	readonly value?: boolean | undefined;
	readonly required?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `boolean \| undefined` | Default boolean value used when the input is `undefined`. Read only. Defaults to `false`. |
| `required` | `boolean \| undefined` | When `true`, a falsy result is rejected as invalid. Read only. Defaults to `false`. |
