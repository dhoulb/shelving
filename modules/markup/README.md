# markup

A rule-based Markdown renderer that produces JSX output for user-facing content.

## Concepts

This module converts Markdown text into JSX nodes — suitable for rendering blog post bodies, user-written descriptions, or any rich text that originates outside your code. It does not depend on a specific JSX framework; it emits plain JSX element objects that React (or any compatible renderer) can consume.

The renderer is rule-based. Each block element type — heading, paragraph, blockquote, fenced code block, ordered list, unordered list, separator — is handled by an independent `MarkupRule`. Inline elements (bold, italic, inline code, links, autolinks, line breaks) are a separate rule set applied within block content. Rules match via regular expression and render to a JSX element; the engine picks the highest-priority earliest match at each position and recurses on the prefix and suffix.

The default ruleset intentionally diverges from CommonMark in a few places:

- `*asterisk*` is always `<strong>`, `_underscore_` is always `<em>`. There is no ambiguity between the two.
- A single `\n` newline is always a `<br />`. You do not need a trailing double-space.
- Literal HTML tags and `&amp;` character entities are not supported — they are treated as plain text.
- All bare URLs are autolinked.

## Usage

### Rendering Markdown to JSX

```ts
import { renderMarkup, MARKUP_RULES } from "shelving/markup";

const node = renderMarkup("# Hello\n\nThis is **bold** and _italic_.", {
  rules: MARKUP_RULES,
});

// `node` is a JSXNode — pass it anywhere React expects children.
```

`renderMarkup` returns a `JSXNode`: a single `JSXElement`, a `string`, an array of those, `null`, or `undefined`.

### Options

| Option | Type | Description |
|---|---|---|
| `rules` | `MarkupRules` | The rules to apply (required). Use `MARKUP_RULES` for the default set. |
| `rel` | `string` | `rel` attribute applied to all rendered links, e.g. `"nofollow ugc"`. |
| `base` | `URLString` | Base URL for resolving relative links. Defaults to `window.location.href` in browser environments. |
| `schemes` | `URISchemes` | Allowed URI schemes for links. Defaults to `["http:", "https:"]`. |

```ts
const node = renderMarkup(content, {
  rules: MARKUP_RULES,
  rel: "nofollow ugc",
  base: "https://example.com",
  schemes: ["http:", "https:", "mailto:"],
});
```

### Block-only or inline-only rendering

If you need to render only block-level content or only inline content, use the focused rule sets directly:

```ts
import { renderMarkup, MARKUP_RULES_BLOCK, MARKUP_RULES_INLINE } from "shelving/markup";

// Inline only — no block wrappers like <p> or <h1>.
const inline = renderMarkup("Some *bold* text", { rules: MARKUP_RULES_INLINE }, "inline");
```

The third argument to `renderMarkup` is the starting context (`"block"` by default). Rules declare which contexts they apply in, so passing `"inline"` skips all block-level rules.

### Custom rules

Build custom rules with `getMarkupRule` and combine them with the defaults:

```ts
import { getMarkupRule, MARKUP_RULES, renderMarkup } from "shelving/markup";
import { REACT_ELEMENT_TYPE } from "shelving/markup/util/internal";

const HIGHLIGHT_RULE = getMarkupRule(
  /==(?<text>[^=]+)==/,
  ({ groups: { text } }, options, key) => ({
    key,
    $$typeof: REACT_ELEMENT_TYPE,
    type: "mark",
    props: { children: text },
  }),
  ["inline"],
);

const node = renderMarkup(content, {
  rules: [...MARKUP_RULES, HIGHLIGHT_RULE],
});
```

## See also

- [error](../error/README.md) — error classes used elsewhere in shelving
- [util](../util/README.md) — shared utilities including JSX types and regexp helpers
