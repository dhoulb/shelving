# MarkupParser

- Kind: class
- Import: `import { MarkupParser } from "shelving/markup";`
- Implements: `Parser<string, ReactNode>`

Parses a Markdownish markup string and renders it as a React node using a tiered, masking rule engine.
- The syntax isn't hardcoded — it's defined entirely by the `rules` supplied (defaults to `MARKUP_RULES`).
- Rules are grouped into priority tiers and resolved highest tier first; a claimed region is masked so lower-priority rules can't match into or across it.
- Rules own the recursion into their own children by calling `parse()` again, optionally with a different context.

## Signatures

```ts
new MarkupParser({ rules = MARKUP_RULES, rel, url, root, schemes = HTTP_SCHEMES, context = "block", depth = 0 }: MarkupOptions = {})
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `options` | `MarkupOptions` | Defaults to `{}`. |
| `.rules` | `MarkupRules \| undefined` | The active list of parsing rules. Read only. Defaults to `MARKUP_RULES`. |
| `.rel` | `string \| undefined` | Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`). Read only. Optional. |
| `.url` | `ImmutableURL \| undefined` | Current page URL — used as the base for resolving relative refs (`./foo`, `#x`, bare segments) in link hrefs. Read only. Optional. |
| `.root` | `ImmutableURL \| undefined` | Site root URL — used as the base for resolving site-absolute path hrefs (`/foo`), honoring its subfolder. Read only. Optional. |
| `.schemes` | `URISchemes \| undefined` | Valid URI schemes/protocols for URLs and URIs. Read only. Defaults to `["http:", "https:"]`. |
| `.context` | `string` | Default context to use if one isn't set. Defaults to `"block"` Read only. Optional. |
| `.depth` | `number \| undefined` | Current nesting depth — used to cap self-recursive rules (e.g. blockquotes) so pathological input can't overflow the stack. Internal: set automatically as rules recurse via `MarkupParser.nested()`; callers normally leave it at the default `0`. Read only. Defaults to `0`. |

## Returns

| Type | Description |
| --- | --- |
| `MarkupParser` |  |

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `rules` | `MarkupRules` | The list of parsing rules this parser applies. Read only. |
| `priorities` | `ImmutableArray<number>` | Calculated list of priorities to iterate over (extracted from the rules), e.g. [10, 0, -10] Read only. |
| `rel` | `string \| undefined` | Set the `rel=""` property used for any links (e.g. `rel="nofollow ugc"`). Read only. |
| `url` | `ImmutableURL \| undefined` | Current page URL — used as the base for resolving relative refs (`./foo`, `#x`, bare segments) in link hrefs. Falls back to `root` if not set. Read only. |
| `root` | `ImmutableURL \| undefined` | Site root URL — used as the base for resolving site-absolute path hrefs (`/foo`), honoring its subfolder. Falls back to `url` if not set. Read only. |
| `schemes` | `URISchemes` | Valid URI schemes/protocols for URLs and URIs. Read only. Defaults to `["http:", "https:"]`. |
| `context` | `string` | Default context to use if one isn't set. Defaults to `"block"` Read only. |
| `depth` | `number` | Current nesting depth, incremented by `nested()` as self-recursive rules descend. Used to cap recursion so pathological input (e.g. a long `>>>>…` blockquote) can't overflow the stack. Read only. |

## Methods

- [nested](MarkupParser/nested.md): Return a copy of this parser with depth incremented by one, sharing all other options.
- [parse](MarkupParser/parse.md): Parse a text string as Markdownish markup syntax and render it as a React node.
- [getRules](MarkupParser/getRules.md): Yield the rules active in context that sit in the given priority tier.
- [getLink](MarkupParser/getLink.md): Resolve a link href against this parser's url and root, returning it only if its scheme is allowed.
