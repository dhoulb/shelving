# testDBDifferential()

- Kind: function
- Import: `import { testDBDifferential } from "shelving/test";`

Register a differential test that runs the same random operations against a provider and against a reference `MemoryDBProvider`, and fails at the first difference.

- After each operation it compares the result, any error, and the full contents of `BASICS_COLLECTION`.
- Operations use a small set of ids and values, so they often touch the same items and match the same queries.
- Every `$order` ends with `id`, so the order is total and the same in every backend.
- A failure message names the seed, the operation, and every operation before it, so you can reproduce it.

## Signatures

```ts
testDBDifferential(name: string, createProvider: () => DBProvider<string, Data> | PromiseLike<DBProvider<string, Data>>, {
		runs = 25,
		length = 40,
		seed = 1,
		nested = true,
		unorderedArrays = false,
		check,
		wrap = (provider, callback) => callback(provider),
	}: TestDBDifferentialOptions = {}): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name for the provider, used in the test name. |
| `createProvider` | `() => DBProvider<string, Data> \| PromiseLike<DBProvider<string, Data>>` | Create (or return) the provider to test. The test wipes `BASICS_COLLECTION` before each sequence. |
| `options` | `TestDBDifferentialOptions` | Options for the test. Defaults to `{}`. |
| `.runs` | `number` | Number of random sequences to run. Each sequence uses its own seed, so a failure names a seed you can run again. Read only. Defaults to `25`. |
| `.length` | `number` | Number of random operations in each sequence. Read only. Defaults to `40`. |
| `.seed` | `number` | First seed. Read only. Defaults to `1`. |
| `.nested` | `boolean` | Whether the operations use nested keys like `sub.num` in filters, orders and updates. Read only. Defaults to `true`. |
| `.unorderedArrays` | `boolean` | Whether to compare `tags` arrays as sets, for backends that do not keep array order in `with` / `omit` updates (e.g. SQL). Read only. Defaults to `false`. |
| `.check` | `(provider: DBProvider<string, Data>) => Promise<Items<string, Data>>` | Get more state from the provider to compare with the reference after each operation, e.g. a copy of the provider made from its backing store. Read only. Optional. |
| `.wrap` | `( provider: DBProvider<string, Data>, callback: (provider: DBProvider<string, Data>) => Promise<unknown>, ) => Promise<unknown>` | Wrap each operation, e.g. to run it inside a transaction with `(provider, callback) => provider.transact(callback)`. Read only. Optional. |

## Examples

```ts
testDBDifferential("ValidationDBProvider", () => new ValidationDBProvider(new MemoryDBProvider<string>()));
```
