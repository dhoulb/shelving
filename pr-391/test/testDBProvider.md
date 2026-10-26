# testDBProvider()

- Kind: function
- Import: `import { testDBProvider } from "shelving/test";`

Register the universal `DBProvider` contract test suite against a provider, so every backend proves the same behaviour.

- Calls `createProvider()` fresh for every test and wipes `BASICS_COLLECTION` and `PEOPLE_COLLECTION` first, so persistent backends (e.g. an emulator) start each test clean.
- Declare the provider's capabilities via options — unsupported capabilities are asserted to throw `UnsupportedError` rather than skipped.

## Signatures

```ts
testDBProvider(name: string, createProvider: () => DBProvider<string, Data> | PromiseLike<DBProvider<string, Data>>, { realtime = true, transactions = false, nestedTransactions = false }: TestDBProviderOptions = {}): void
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `name` | `string` | Name for the provider used in the `describe` block. |
| `createProvider` | `() => DBProvider<string, Data> \| PromiseLike<DBProvider<string, Data>>` | Create (or return) the provider instance to test. |
| `options` | `TestDBProviderOptions` | Capability flags for the provider under test. Defaults to `{}`. |
| `.realtime` | `boolean` | Whether the provider supports realtime sequences — when `false`, sequences are asserted to throw `UnsupportedError` (including inside `transact()`); when `true` combined with `transactions`, sequences inside a transaction are asserted to observe the transaction and end with it. Read only. Defaults to `true`. |
| `.transactions` | `boolean` | Whether the provider supports `transact()` — when `false`, it is asserted to throw `UnsupportedError`. Read only. Defaults to `false`. |
| `.nestedTransactions` | `boolean` | Whether `transact()` can be nested, committing the inner transaction into the outer — when `false`, nested calls are asserted to throw `UnsupportedError`. Read only. Defaults to `false`. |

## Examples

```ts
testDBProvider("MemoryDBProvider", () => new MemoryDBProvider<string>());
```
