# VectorSchemaOptions

- Kind: interface
- Import: `import { VectorSchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Allowed options for `VectorSchema`.

## Signatures

```ts
{
	readonly size: number;
	readonly value?: VectorArray | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `size` | `number` | The exact number of numbers in the vector. Read only. |
| `value` | `VectorArray \| undefined` | Default vector used when the input is `undefined`. Read only. Defaults to `` A vector of `size` zeros ``. |
