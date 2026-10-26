# shelving/markup

- Kind: module
- Import: `import { … } from "shelving/markup";`

A rule-based Markdown renderer that turns user-facing text into React nodes.

## Concepts

This module converts Markdown-ish text into React nodes — suitable for rendering blog post bodies, user-written descriptions, or any rich text that originates outside your code.

Rendering is done by a `MarkupParser` instance. Each block element type — heading, paragraph, blockquote, fenced code, ordered list, unordered list (including `[ ]` / `[x]` todo items), table, separator — is handled by an independent `MarkupRule`. Inline elements — bold, italic, inserted/deleted/highlighted text, inline code, links, autolinks, line breaks — are a separate rule set applied within block content.

The engine groups rules into priority tiers and resolves the highest tier first. Once a tier claims a region of the text that region is "masked" so lower tiers cannot match into or across it. Each rule renders its match to a React element and recurses into its own children, optionally in a different context.

The default ruleset intentionally diverges from CommonMark:

- `*asterisk*` is always `<strong>`, `_underscore_` is always `<em>` — no ambiguity between the two.
- A single `\n` newline is always a `<br />` — no trailing double-space needed.
- Literal HTML tags and `&amp;` character entities are not supported — they render as plain text.
- All bare URLs are autolinked.
- Whitespace is not fussy: there is no four-space indented code block, and nesting (e.g. a sub-list) uses a single tab per level — see [Input normalisation](#input-normalisation).

## Usage

### Rendering markup

Create a `MarkupParser` and call `MarkupParser.parse()`:

```ts
import { MarkupParser } from "shelving/markup";

const parser = new MarkupParser();
const node = parser.parse("# Hello\n\nThis is *bold* and _italic_.");
// `node` is a `ReactNode` — render it directly in JSX.
```

`parse()` returns a `ReactNode`: a single element, a string, an array of those, or `null`.

For the common case the shared `MARKUP_PARSER` sentinel — a `MarkupParser` with default options — saves constructing one:

```ts
import { MARKUP_PARSER } from "shelving/markup";

const node = MARKUP_PARSER.parse(content);
```

### Input length (untrusted content)

`parse()` is linear in the length of normal content, but a few rules can still degrade on deliberately adversarial input — notably long unbroken runs of backtick code fences, and deeply-nested `>` blockquotes (each leading `>` recurses one level, so a pathological line can overflow the stack).

When the source comes from users, **cap its length before parsing**. A sane maximum for your use case — for typical user-generated content, tens of kilobytes — keeps worst-case work bounded:

```ts
const MAX_MARKUP_LENGTH = 100_000;
if (source.length > MAX_MARKUP_LENGTH) throw new Error("Content too long");
const node = MARKUP_PARSER.parse(source);
```

### Options

`MarkupParser` is constructed with `MarkupOptions`:

| Option | Type | Description |
|---|---|---|
| `rules` | `MarkupRules` | Rules to apply. Defaults to `MARKUP_RULES` (all block + inline rules). |
| `rel` | `string` | `rel` attribute applied to every rendered link, e.g. `"nofollow ugc"`. |
| `url` | `ImmutableURL` | Current page URL — base for resolving relative refs (`./foo`, `#x`). |
| `root` | `ImmutableURL` | Site root URL — base for resolving site-absolute paths (`/foo`). |
| `schemes` | `URISchemes` | Allowed URI schemes for links. Defaults to `["http:", "https:"]`. |
| `context` | `string` | Default starting context. Defaults to `"block"`. |

```ts
const parser = new MarkupParser({
  rel: "nofollow ugc",
  url: requireURL("https://example.com/page/"),
  root: requireURL("https://example.com/"),
  schemes: ["http:", "https:", "mailto:"],
});
```

Link href resolution goes through `getLink()` — site-absolute paths resolve against `root`, relative refs against `url`, scheme-prefixed URIs (`mailto:`, `tel:`, …) pass through, `URL` instances are emitted as-is.

### Block-only or inline-only rendering

`MarkupParser.parse()` takes an optional second argument — the starting context. Rules declare which contexts they apply in, so `"inline"` skips every block-level rule:

```ts
// Inline only — no block wrappers like <p> or <h1>.
const inline = MARKUP_PARSER.parse("Some *bold* text", "inline");
```

`MARKUP_RULES_BLOCK` and `MARKUP_RULES_INLINE` expose the block and inline rule sets separately if you want a parser with only one.

### Custom rules

Build custom rules with `createMarkupRule()` and combine them with the defaults:

```tsx
import { createMarkupRule, MARKUP_RULES, MarkupParser } from "shelving/markup";

const HIGHLIGHT_RULE = createMarkupRule<{ text: string }>(
  /==(?<text>[^=]+)==/,
  (key, { text }) => <mark key={key}>{text}</mark>,
  ["inline"],
);

const parser = new MarkupParser({ rules: [...MARKUP_RULES, HIGHLIGHT_RULE] });
```

`createMarkupRule()` takes a regexp (named captures are typed), a render function `(key, data, parser) => ReactElement`, the `contexts` the rule applies in, and an optional `priority` (default `0`; higher priorities form earlier-resolved tiers). See `shelving/markup` for the full built-in rule set.

## Input normalisation

The parser expects **normalised** input and deliberately does not try to absorb every whitespace variation. Normalised text means:

- Indentation is **tabs** — one tab per nesting level. Leading spaces are not significant.
- No trailing whitespace at the end of a line.
- No runs of more than two `\n` newlines; `\r\n` / `\r` line endings are normalised to `\n`.
- Control characters are removed.

Keeping this guarantee out of the rules is what keeps them simple: nesting — a sub-list inside a list item, a quote inside a quote — is always exactly one extra tab, never an ambiguous run of spaces.

Normalisation is **not** performed by the parser — give it text that is already clean. `sanitizeMultilineText()` from `shelving/util/string` produces exactly this form: it converts four-space indents to tabs, strips sub-tab leading spaces, trims trailing whitespace, and collapses three-or-more newlines to two. `StringSchema` runs `sanitizeMultilineText()` automatically when validating any multi-line field (`rows > 1`), so text stored through a schema is already normalised.

```ts
import { sanitizeMultilineText } from "shelving/util";

// Raw / untrusted text — normalise before parsing.
const node = MARKUP_PARSER.parse(sanitizeMultilineText(untrustedInput));
```

If the text reaches you straight from a `StringSchema`-validated field it is already normalised, and you can parse it directly.


## Functions

- [createMarkupRule()](markup/createMarkupRule.md): Create a typed MarkupRule from a NamedRegExp, a renderer, its contexts, and an optional priority.
- [createBlockRegExp()](markup/createBlockRegExp.md): Create a RegExp that matches a block of content, wrapped between block-start and block-end boundaries.
- [createLineRegExp()](markup/createLineRegExp.md): Create a RegExp that matches a single line of content, wrapped between line-start and line-end boundaries.
- [createWordRegExp()](markup/createWordRegExp.md): Create a RegExp that matches a word of content, wrapped between word-start and word-end boundaries.

## Classes

- [MarkupParser](markup/MarkupParser.md): Parses a Markdownish markup string and renders it as a React node using a tiered, masking rule engine.
- [Parser](markup/Parser.md): Base class for a parser that converts an input of type I into an output of type O.

## Interfaces

- [MarkupRule](markup/MarkupRule.md): A single markup rule: a regular expression that matches a span of input plus a renderer that turns the match into an element.

## Types

- [MarkupOptions](markup/MarkupOptions.md): Options configuring a MarkupParser (represents the current state of the parsing).
- [MarkupContexts](markup/MarkupContexts.md): One or more named contexts a markup rule renders in (e.g. ["block"], ["inline", "list", "link"]).
- [MarkupRules](markup/MarkupRules.md): An immutable list of MarkupRule instances applied by a MarkupParser.

## Constants

- [MARKUP_PARSER](markup/MARKUP_PARSER.md): Shared MarkupParser instance configured with the default markup rules and behaviour.
- [BLOCKQUOTE_RULE](markup/BLOCKQUOTE_RULE.md): Blockquote block.
- [CODE_RULE](markup/CODE_RULE.md): Inline code.
- [FENCED_RULE](markup/FENCED_RULE.md): Fenced code blocks
- [HEADING_RULE](markup/HEADING_RULE.md): Headings are single line only (don't allow multiline).
- [MARKUP_RULES_BLOCK](markup/MARKUP_RULES_BLOCK.md): Default markup rules that render in a block context — fenced code, headings, separators, lists, blockquotes, tables, and paragraphs.
- [MARKUP_RULES_INLINE](markup/MARKUP_RULES_INLINE.md): Default markup rules that render in an inline context — inline code, links, autolinks, emphasis, and hard linebreaks.
- [MARKUP_RULES](markup/MARKUP_RULES.md): Default markup rules — the combined block and inline rules MarkupParser uses when none are supplied.
- [INLINE_RULE](markup/INLINE_RULE.md): Inline strong, emphasis, insert, delete, highlight.
- [LINEBREAK_RULE](markup/LINEBREAK_RULE.md): Hard linebreak (<br /> tag).
- [LINK_RULE](markup/LINK_RULE.md): Markdown-style link.
- [AUTOLINK_RULE](markup/AUTOLINK_RULE.md): Autolinked URL starts with scheme: (any scheme in MarkupOptions.schemes) and matches an unlimited number of non-space characters.
- [ORDERED_RULE](markup/ORDERED_RULE.md): Ordered list.
- [PARAGRAPH_RULE](markup/PARAGRAPH_RULE.md): Paragraph.
- [SEPARATOR_RULE](markup/SEPARATOR_RULE.md): Separator (horizontal rule / thematic break).
- [TABLE_RULE](markup/TABLE_RULE.md): Table.
- [UNORDERED_RULE](markup/UNORDERED_RULE.md): Unordered list.
- [BLOCK_CONTENT_REGEXP](markup/BLOCK_CONTENT_REGEXP.md): Regular expression source matching block content — the shortest run of any character.
- [BLOCK_SPACE_REGEXP](markup/BLOCK_SPACE_REGEXP.md): Regular expression source matching block whitespace — any single whitespace character.
- [BLOCK_START_REGEXP](markup/BLOCK_START_REGEXP.md): Regular expression source matching the start of a block — the start of the string, or one linebreak.
- [BLOCK_END_REGEXP](markup/BLOCK_END_REGEXP.md): Regular expression source matching the end of a block — the end of the string, or two linebreaks, with trailing whitespace trimmed.
- [LINE_CONTENT_REGEXP](markup/LINE_CONTENT_REGEXP.md): Regular expression source matching line content — the shortest run of any character except newline.
- [LINE_SPACE_REGEXP](markup/LINE_SPACE_REGEXP.md): Regular expression source matching line whitespace — any single whitespace character except newline.
- [LINE_START_REGEXP](markup/LINE_START_REGEXP.md): Regular expression source matching the start of a line — the start of the string, or one linebreak.
- [LINE_END_REGEXP](markup/LINE_END_REGEXP.md): Regular expression source matching the end of a line — the end of the string, or one linebreak, with trailing whitespace trimmed.
- [WORD_CONTENT_REGEXP](markup/WORD_CONTENT_REGEXP.md): Regular expression source matching word content — at least one letter or number character.
- [WORD_START_REGEXP](markup/WORD_START_REGEXP.md): Regular expression source matching the start of a word — a zero-width assertion that the previous character is not a letter or number.
- [WORD_END_REGEXP](markup/WORD_END_REGEXP.md): Regular expression source matching the end of a word — a zero-width assertion that the next character is not a letter or number.
