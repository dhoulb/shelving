# Meta

- Kind: interface
- Import: `import { Meta } from "shelving/ui";`

Combined meta data for a website page — title, URLs, description, CSP, tags, links, and assets.

## Signatures

```ts
{
	readonly root?: ImmutableURL | undefined;
	readonly url?: ImmutableURL | undefined;
	readonly app?: string | undefined;
	readonly title?: string | undefined;
	readonly description?: string | undefined;
	readonly image?: string | undefined;
	readonly language?: string | undefined;
	readonly csp?: MetaCSP | undefined;
	readonly tags?: MetaTags | undefined;
	readonly links?: MetaLinks | undefined;
	readonly modules?: MetaAssets | undefined;
	readonly scripts?: MetaAssets | undefined;
	readonly stylesheets?: MetaAssets | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `root` | `ImmutableURL \| undefined` | Base URL for the app (used to resolve `url` and set as `<base>` tag in `<Head>`). Read only. Optional. |
| `url` | `ImmutableURL \| undefined` | URL of the current page (used to update history API and as the initial URL for routing). Read only. Optional. |
| `app` | `string \| undefined` | Title of the entire application. Read only. Optional. |
| `title` | `string \| undefined` | Title of the current page (set as `<title>` in `<Head>` Read only. Optional. |
| `description` | `string \| undefined` | Description of the current page. Read only. Optional. |
| `image` | `string \| undefined` | Read only. Optional. |
| `language` | `string \| undefined` | Language code (used for `lang` tag in HTML). Read only. Optional. |
| `csp` | `MetaCSP \| undefined` | Read only. Optional. |
| `tags` | `MetaTags \| undefined` | Read only. Optional. |
| `links` | `MetaLinks \| undefined` | Read only. Optional. |
| `modules` | `MetaAssets \| undefined` | Read only. Optional. |
| `scripts` | `MetaAssets \| undefined` | Read only. Optional. |
| `stylesheets` | `MetaAssets \| undefined` | Read only. Optional. |
