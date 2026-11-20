# OptionalSchemaOptions

- Kind: interface
- Import: `import { OptionalSchemaOptions } from "shelving/schema";`
- Extends: `ThroughSchemaOptions<T | undefined>`

Allowed options for `OptionalSchema`.

## Signatures

```ts
{
	readonly value?: undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `undefined` | Default value is always `undefined` (the default is only used when the input is `undefined`, so otherwise `undefined` could never be returned). Read only. Optional. |
