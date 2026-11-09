# MetaURL

- Kind: interface
- Import: `import { MetaURL } from "shelving/ui";`
- Extends: `Meta`

A `Meta` object with a guaranteed `url`, plus derived `path` and `params` properties.

## Signatures

```ts
{
	url: ImmutableURL;
	root: ImmutableURL;
	path: AbsolutePath;
	params: URIParams;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `url` | `ImmutableURL` |  |
| `root` | `ImmutableURL` |  |
| `path` | `AbsolutePath` | The path of `url` relative to `meta.root` (i.e. the _site-root-relative_ path). |
| `params` | `URIParams` | The `?query` params of `url` extracted as a flat set of parameters. |
