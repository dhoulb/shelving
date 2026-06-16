# Markup rules

The built-in rule set that drives the [`markup`](/markup) renderer. This directory exports every individual rule constant, two context-specific rule arrays, and the combined default ruleset.

## Concepts

Each [`MarkupRule`](/markup/MarkupRule) in this directory handles one element type. Rules are combined into [`MarkupRules`](/markup/MarkupRules) arrays and handed to a [`MarkupParser`](/markup/MarkupParser) (via the `rules` option, or the default [`MARKUP_RULES`](/markup/MARKUP_RULES)).

The engine groups rules into priority tiers and resolves the highest tier first; once a tier claims a region of the text that region is masked so lower tiers cannot match into or across it. `priority` (default `0`) sets the tier — higher resolves first.

Rules declare which contexts they apply in. Block rules fire in a `"block"` context; inline rules fire in `"inline"`, `"list"`, or `"link"` contexts.

## Available rule sets

| Export | Contents |
|---|---|
| `MARKUP_RULES` | All block and inline rules — the default, use this unless you have a reason not to |
| [`MARKUP_RULES_BLOCK`](/markup/MARKUP_RULES_BLOCK) | Block-only rules: fenced code, heading, separator, lists, blockquote, table, paragraph |
| [`MARKUP_RULES_INLINE`](/markup/MARKUP_RULES_INLINE) | Inline-only rules: inline code, link, autolink, strong/em/del/ins/mark, linebreak |

## Block rules

| Rule constant | Element | Syntax |
|---|---|---|
| [`FENCED_RULE`](/markup/FENCED_RULE) | `<pre><code>` | ` ``` ` or `~~~` fenced code block; optional language after the fence |
| [`HEADING_RULE`](/markup/HEADING_RULE) | `<h1>`–`<h6>` | `#` through `######` followed by a space |
| [`SEPARATOR_RULE`](/markup/SEPARATOR_RULE) | `<hr>` | Three or more repeated `-`, `*`, `•`, `+`, `_`, or `=` characters |
| [`UNORDERED_RULE`](/markup/UNORDERED_RULE) | `<ul>` | Lines starting with `-`, `*`, `•`, or `+`; nest with a tab; blank lines between items make the list loose (`<p>`-wrapped); items starting with `[ ]` / `[x]` render a todo checkbox |
| [`ORDERED_RULE`](/markup/ORDERED_RULE) | `<ol>` | Lines starting with a number followed by `.`, `)`, or `:`; blank lines between items make the list loose (`<p>`-wrapped) |
| [`BLOCKQUOTE_RULE`](/markup/BLOCKQUOTE_RULE) | `<blockquote>` | Lines starting with `>` |
| [`TABLE_RULE`](/markup/TABLE_RULE) | `<table>` | Pipe table: header row, `\|---|` delimiter row, body rows |
| [`PARAGRAPH_RULE`](/markup/PARAGRAPH_RULE) | `<p>` | Any remaining block content (priority `-10`, matches last) |

## Inline rules

| Rule constant | Element | Syntax |
|---|---|---|
| [`CODE_RULE`](/markup/CODE_RULE) | `<code>` | `` `backtick-wrapped` `` text (priority `10`) |
| [`LINK_RULE`](/markup/LINK_RULE) | `<a>` | `[title](url)` |
| [`AUTOLINK_RULE`](/markup/AUTOLINK_RULE) | `<a>` | Bare URL starting with any scheme, e.g. `https://example.com` |
| [`INLINE_RULE`](/markup/INLINE_RULE) | `<strong>`, `<em>`, `<del>`, `<ins>`, `<mark>` | `*bold*`, `_italic_`, `~del~`, `+ins+`, `=mark=` |
| [`LINEBREAK_RULE`](/markup/LINEBREAK_RULE) | `<br>` | Any single `\n` newline inside inline content |

## Adding a custom rule

Use [`createMarkupRule()`](/markup/createMarkupRule) from `shelving/markup` to build a typed rule, then merge it into the rules array you give a `MarkupParser`:

```tsx
import { createMarkupRule, MARKUP_RULES, MarkupParser } from "shelving/markup";

const HIGHLIGHT_RULE = createMarkupRule<{ text: string }>(
  /==(?<text>[^=]+)==/,
  (key, { text }) => <mark key={key}>{text}</mark>,
  ["inline"],
  5, // optional priority; default is 0
);

const parser = new MarkupParser({ rules: [...MARKUP_RULES, HIGHLIGHT_RULE] });
```

`createMarkupRule()` accepts:

1. A `RegExp` or named-capture [`NamedRegExp`](/util/regexp/NamedRegExp).
2. A render function `(key, data, parser) => ReactElement`. `data` is the regexp's named capture groups, typed when you pass a `NamedRegExp`.
3. A `contexts` array — at least one of `"block"`, `"inline"`, `"list"`, `"link"`.
4. An optional `priority` number (default `0`). Higher priorities form earlier-resolved tiers.

To replace the built-in rule for a specific element, omit that constant from the base array and add your own.

## See also

- [`markup`](/markup) — `MarkupParser`, `MarkupRule`, `createMarkupRule`, and the full renderer
- [`markup/util`](/markup) — regexp helpers and internal types used by the rules
