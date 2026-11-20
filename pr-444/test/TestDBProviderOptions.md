# TestDBProviderOptions

- Kind: interface
- Import: `import { TestDBProviderOptions } from "shelving/test";`

Options for `testDBProvider()`, declaring the capabilities of the provider under test.

## Signatures

```ts
{
	readonly realtime?: boolean;
	readonly transactions?: boolean;
	readonly nestedTransactions?: boolean;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `realtime` | `boolean` | Whether the provider supports realtime sequences — when `false`, sequences are asserted to throw `UnsupportedError` (including inside `transact()`); when `true` combined with `transactions`, sequences inside a transaction are asserted to observe the transaction and end with it. Read only. Defaults to `true`. |
| `transactions` | `boolean` | Whether the provider supports `transact()` — when `false`, it is asserted to throw `UnsupportedError`. Read only. Defaults to `false`. |
| `nestedTransactions` | `boolean` | Whether `transact()` can be nested, committing the inner transaction into the outer — when `false`, nested calls are asserted to throw `UnsupportedError`. Read only. Defaults to `false`. |
