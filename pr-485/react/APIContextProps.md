# APIContextProps

- Kind: interface
- Import: `import { APIContextProps } from "shelving/react";`

Props for the `<APIContext>` component returned by `createAPIContext()`.

## Signatures

```ts
{
	readonly children?: ReactNode;
	readonly provider?: APIProvider<P, R> | undefined;
	readonly cache?: APICache<P, R> | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `children` | `ReactNode` | Read only. Optional. |
| `provider` | `APIProvider<P, R> \| undefined` | The provider to call, in place of the one given to `createAPIContext()`. The context makes its own `APICache` for it, and a new one when it changes. Read only. Optional. |
| `cache` | `APICache<P, R> \| undefined` | An `APICache` you made, used as it is. It wins over `provider`. Read only. Optional. |
