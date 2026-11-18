# MarkupOptions

- Kind: type
- Import: `import { MarkupOptions } from "shelving/markup";`

Options configuring a `MarkupParser` (represents the current state of the parsing).
- Every field is optional — an empty object yields a parser with the default rules and behaviour.
- Link resolution honours `url`, `root`, and `schemes`; link safety hinges on `schemes`.

## Signatures

```ts
{
	readonly rules?: MarkupRules | undefined;
	readonly rel?: string | undefined;
	readonly url?: ImmutableURL | undefined;
	readonly root?: ImmutableURL | undefined;
	readonly schemes?: URISchemes | undefined;
	readonly context?: string;
	readonly depth?: number | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `rules` | `MarkupRules \| undefined` | The active list of parsing rules. Read only. Defaults to `MARKUP_RULES`. |
| `rel` | `string \| undefined` | Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`). Read only. Optional. |
| `url` | `ImmutableURL \| undefined` | Current page URL — used as the base for resolving relative refs (`./foo`, `#x`, bare segments) in link hrefs. Read only. Optional. |
| `root` | `ImmutableURL \| undefined` | Site root URL — used as the base for resolving site-absolute path hrefs (`/foo`), honoring its subfolder. Read only. Optional. |
| `schemes` | `URISchemes \| undefined` | Valid URI schemes/protocols for URLs and URIs. Read only. Defaults to `["http:", "https:"]`. |
| `context` | `string` | Default context to use if one isn't set. Defaults to `"block"` Read only. Optional. |
| `depth` | `number \| undefined` | Current nesting depth — used to cap self-recursive rules (e.g. blockquotes) so pathological input can't overflow the stack. Internal: set automatically as rules recurse via `MarkupParser.nested()`; callers normally leave it at the default `0`. Read only. Defaults to `0`. |

## Types

- [MarkupRules](MarkupRules.md): An immutable list of MarkupRule instances applied by a MarkupParser.
- [ImmutableURL](../util/url/ImmutableURL.md): Object that describes a valid URL, e.g. http://example.com/path/to/resource
- [URISchemes](../util/uri/URISchemes.md): List of allowed URI schemes.
