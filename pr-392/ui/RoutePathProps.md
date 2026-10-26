# RoutePathProps

- Kind: interface
- Import: `import { RoutePathProps } from "shelving/ui";`

Props for `<RoutePath>` — the path template the page owns, and the page content.

## Signatures

```ts
{
	readonly path: AbsolutePath;
	readonly children?: ReactNode;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath` | Path template the page owns, for example `/dave/{tab}`. Every path that matches it shows this same page. Read only. |
| `children` | `ReactNode` | The page content. Read only. Optional. |
