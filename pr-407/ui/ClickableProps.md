# ClickableProps

- Kind: interface
- Import: `import { ClickableProps } from "shelving/ui";`
- Extends: `OptionalChildProps`

Props for a thing that can be clicked — either has a string `href` link or an `onClick` callback handler.

## Signatures

```ts
{
	disabled?: boolean | undefined;
	href?: ImmutableURI | Path | URIString | undefined;
	onClick?: ClickableCallback | undefined;
	target?: string | undefined;
	download?: string | undefined;
	title?: string | undefined;
	selected?: boolean | undefined;
	back?: boolean | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `disabled` | `boolean \| undefined` | Whether the clickable is currently disabled. Optional. |
| `href` | `ImmutableURI \| Path \| URIString \| undefined` | If present then render this element as an `<a>` link (takes precidence over `onClick`). Optional. |
| `onClick` | `ClickableCallback \| undefined` | If present then render this element as a `<button>` Optional. |
| `target` | `string \| undefined` | Target, e.g. `_blank` Optional. |
| `download` | `string \| undefined` | If `href` is present then this is the suggested filename for downloading. Optional. |
| `title` | `string \| undefined` | Title shown on hover. Optional. |
| `selected` | `boolean \| undefined` | Whether this is the selected item in a group. Sets `aria-pressed` on a `<button>`, or `aria-current` on an `<a>`. Optional. |
| `back` | `boolean \| undefined` | If `href` is present, then `<Navigation>` opens the link with a back transition. Use it for a "back to" link. Sets `data-back` on the `<a>`. Optional. |
