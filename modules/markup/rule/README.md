# Markup rules

The built-in rule set that drives the [markup](/markup) renderer. This directory exports every individual rule constant, two context-specific rule arrays, and the combined default ruleset.

## Concepts

Each `MarkupRule` in this directory handles one element type. Rules are combined into `MarkupRules` arrays and passed to `renderMarkup` as `options.rules`. The renderer tries every rule against the current input, picks the highest-priority earliest match, renders that element, then recurses on the text before and after it.

Rules declare which contexts they apply in. Block rules only fire in a `"block"` context; inline rules fire in `"inline"`, `"list"`, or `"link"` contexts. The `priority` field (default `0`) breaks ties when two rules match at the same position.

## Available rule sets

| Export | Contents |
|---|---|
| `MARKUP_RULES` | All block and inline rules — the default, use this unless you have a reason not to |
| `MARKUP_RULES_BLOCK` | Block-only rules: fenced code, heading, separator, lists, blockquote, table, paragraph |
| `MARKUP_RULES_INLINE` | Inline-only rules: inline code, link, autolink, strong/em/del/ins/mark, linebreak |
| `MARKUP_OPTIONS` | `{ rules: MARKUP_RULES }` — a ready-made options object |

## Block rules

| Rule constant | Element | Syntax |
|---|---|---|
| `FENCED_RULE` | `<pre><code>` | ` ``` ` or `~~~` fenced code block; optional language after the fence |
| `HEADING_RULE` | `<h1>`–`<h6>` | `#` through `######` followed by a space |
| `SEPARATOR_RULE` | `<hr>` | Three or more repeated `-`, `*`, `•`, `+`, `_`, or `=` characters |
| `UNORDERED_RULE` | `<ul>` | Lines starting with `-`, `*`, `•`, or `+`; nest with a tab; blank lines between items make the list loose (`<p>`-wrapped); items starting with `[ ]` / `[x]` render a todo checkbox |
| `ORDERED_RULE` | `<ol>` | Lines starting with a number followed by `.`, `)`, or `:`; blank lines between items make the list loose (`<p>`-wrapped) |
| `BLOCKQUOTE_RULE` | `<blockquote>` | Lines starting with `>` |
| `TABLE_RULE` | `<table>` | Pipe table: header row, `\|---|` delimiter row, body rows |
| `PARAGRAPH_RULE` | `<p>` | Any remaining block content (priority `-10`, matches last) |

## Inline rules

| Rule constant | Element | Syntax |
|---|---|---|
| `CODE_RULE` | `<code>` | `` `backtick-wrapped` `` text (priority `10`) |
| `LINK_RULE` | `<a>` | `[title](url)` |
| `AUTOLINK_RULE` | `<a>` | Bare URL starting with any scheme, e.g. `https://example.com` |
| `INLINE_RULE` | `<strong>`, `<em>`, `<del>`, `<ins>`, `<mark>` | `*bold*`, `_italic_`, `-del-` or `~del~`, `+ins+`, `=mark=` |
| `LINEBREAK_RULE` | `<br>` | Any single `\n` newline inside inline content |

## Adding a custom rule

Use `createMarkupRule` from `shelving/markup` to build a typed rule, then merge it into the rules array you pass to `renderMarkup`:

```ts
import { createMarkupRule, MARKUP_RULES, renderMarkup } from "shelving/markup";

const HIGHLIGHT_RULE = createMarkupRule(
  /==(?<text>[^=]+)==/,
  ({ groups: { text } }, _options, key) => <mark key={key}>{text}</mark>,
  ["inline"],
  5, // optional priority; default is 0
);

const node = renderMarkup(content, {
  rules: [...MARKUP_RULES, HIGHLIGHT_RULE],
});
```

`createMarkupRule` accepts:

1. A `RegExp` or named-capture `NamedRegExp`.
2. A render function `(match, options, key) => ReactElement`. Named captures are typed when you use `NamedRegExp`.
3. A `contexts` array — at least one of `"block"`, `"inline"`, `"list"`, `"link"`.
4. An optional `priority` number (default `0`). Higher values win over same-position matches.

To replace the built-in rule for a specific element, omit that constant from the base array and add your own.

## See also

- [markup](/markup) — `renderMarkup`, `MarkupRule`, `createMarkupRule`, and the full renderer
- [markup/util](/markup/util) — regexp helpers and internal types used by the rules
