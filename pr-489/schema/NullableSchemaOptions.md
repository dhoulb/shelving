# NullableSchemaOptions

- Kind: interface
- Import: `import { NullableSchemaOptions } from "shelving/schema";`
- Extends: `ThroughSchemaOptions<T | null>`

Allowed options for `NullableSchema`.

## Signatures

```ts
{
	readonly value?: T | null;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `T \| null` | Default value used when the input is `undefined`. Read only. Defaults to `null`. |
