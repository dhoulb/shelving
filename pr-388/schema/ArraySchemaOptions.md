# ArraySchemaOptions

- Kind: interface
- Import: `import { ArraySchemaOptions } from "shelving/schema";`
- Extends: `SchemaOptions`

Options for `ArraySchema`.

## Signatures

```ts
{
	readonly value?: ImmutableArray;
	readonly items: Schema<T>;
	readonly min?: number;
	readonly max?: number;
	readonly unique?: boolean;
	readonly separator?: string | RegExp;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `value` | `ImmutableArray` | Default value used when the input is `undefined`. Read only. Defaults to `[]`. |
| `items` | `Schema<T>` | Schema every item in the array must conform to. Read only. |
| `min` | `number` | Minimum number of items. Read only. Defaults to `0`. |
| `max` | `number` | Maximum number of items. Read only. Defaults to `Number.POSITIVE_INFINITY`. |
| `unique` | `boolean` | Whether to deduplicate the items. Read only. Defaults to `false`. |
| `separator` | `string \| RegExp` | String or `RegExp` used to split a string input into items. Read only. Defaults to `","`. |
