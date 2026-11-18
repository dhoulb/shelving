# LoaderProps

- Kind: interface
- Import: `import { LoaderProps } from "shelving/ui";`
- Extends: `ChildProps`

Props for `<Loader>` and `<PageLoader>` — the `children` to load plus an optional `fallback` shown while they suspend.

## Signatures

```ts
{
	readonly fallback?: ReactNode | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `fallback` | `ReactNode \| undefined` | Element rendered while `children` suspend (defaults to `LOADING`). Read only. Optional. |
