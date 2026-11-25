# DBContextProps

- Kind: interface
- Import: `import { DBContextProps } from "shelving/react";`

Props for the `<DBContext>` component returned by `createDBContext()`.

## Signatures

```ts
{
	readonly children?: ReactNode;
	readonly provider?: DBProvider<I, T> | undefined;
	readonly cache?: DBCache<I, T> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | Read only. Optional. |
| `provider` | `DBProvider<I, T> \| undefined` | The provider to read from, in place of the one given to `createDBContext()`. The context makes its own `DBCache` for it, and a new one when it changes. Read only. Optional. |
| `cache` | `DBCache<I, T> \| undefined` | A `DBCache` you made, used as it is. It wins over `provider`. Read only. Optional. |
