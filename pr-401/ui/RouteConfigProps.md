# RouteConfigProps

- Kind: interface
- Import: `import { RouteConfigProps } from "shelving/ui";`

Props for `<RouteConfig>` — the settings of a page for the surrounding `<Router>` and `<RouteCache>`, and the page content.

## Signatures

```ts
{
	readonly path?: AbsolutePath | undefined;
	readonly cache?: boolean | undefined;
	readonly children?: ReactNode;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `path` | `AbsolutePath \| undefined` | Path template the page owns, for example `/dave/{tab}`. Every path that matches it shows this same page. Read only. Optional. |
| `cache` | `boolean \| undefined` | Set to `false` so `<RouteCache>` drops the page when you leave it, and the next visit shows a new page. Defaults to `true`. Read only. Optional. |
| `children` | `ReactNode` | The page content. Read only. Optional. |
