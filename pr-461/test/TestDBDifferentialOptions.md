# TestDBDifferentialOptions

- Kind: interface
- Import: `import { TestDBDifferentialOptions } from "shelving/test";`

Options for `testDBDifferential()`.

## Signatures

```ts
{
	readonly runs?: number;
	readonly length?: number;
	readonly seed?: number;
	readonly nested?: boolean;
	readonly unorderedArrays?: boolean;
	readonly check?: (provider: DBProvider<string, Data>) => Promise<Items<string, Data>>;
	readonly wrap?: (
		provider: DBProvider<string, Data>,
		callback: (provider: DBProvider<string, Data>) => Promise<unknown>,
	) => Promise<unknown>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `runs` | `number` | Number of random sequences to run. Each sequence uses its own seed, so a failure names a seed you can run again. Read only. Defaults to `25`. |
| `length` | `number` | Number of random operations in each sequence. Read only. Defaults to `40`. |
| `seed` | `number` | First seed. Read only. Defaults to `1`. |
| `nested` | `boolean` | Whether the operations use nested keys like `sub.num` in filters, orders and updates. Read only. Defaults to `true`. |
| `unorderedArrays` | `boolean` | Whether to compare `tags` arrays as sets, for backends that do not keep array order in `with` / `omit` updates (e.g. SQL). Read only. Defaults to `false`. |
| `check` | `(provider: DBProvider<string, Data>) => Promise<Items<string, Data>>` | Get more state from the provider to compare with the reference after each operation, e.g. a copy of the provider made from its backing store. Read only. Optional. |
| `wrap` | `( provider: DBProvider<string, Data>, callback: (provider: DBProvider<string, Data>) => Promise<unknown>, ) => Promise<unknown>` | Wrap each operation, e.g. to run it inside a transaction with `(provider, callback) => provider.transact(callback)`. Read only. Optional. |
