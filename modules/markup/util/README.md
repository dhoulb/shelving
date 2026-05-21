# Markup utilities

Internal types and helpers used by the [markup](/markup) renderer and its rules. These are not a public API surface — they are building blocks for rule authors.

## What's here

### `rule.ts` — rule types and `createMarkupRule`

Defines `MarkupRule`, `MarkupRules`, and `MarkupContexts`. Every rule has a `regexp`, a `render` function, a `contexts` array, and a numeric `priority`. `createMarkupRule` is the typed factory used to build rules; it is re-exported from `shelving/markup`.

### `options.ts` — `MarkupOptions`

The options object passed to `renderMarkup` and forwarded to every rule's `render` function. Carries `rules`, `rel`, `url`, `root`, and `schemes`. Rules that produce links read `url`, `root`, `rel`, and `schemes` from this object.

### `regexp.ts` — regexp building blocks

Primitive source strings and factory functions for constructing the regexps rules use:

| Export | Purpose |
|---|---|
| `BLOCK_CONTENT_REGEXP` | Shortest run of any character (including newlines) |
| `BLOCK_START_REGEXP` | Start of block — start-of-string or one newline |
| `BLOCK_END_REGEXP` | End of block — end-of-string or two newlines |
| `LINE_CONTENT_REGEXP` | Shortest run of any character except newline |
| `LINE_START_REGEXP` / `LINE_END_REGEXP` | Line boundary anchors |
| `WORD_CONTENT_REGEXP` / `WORD_START_REGEXP` / `WORD_END_REGEXP` | Unicode word boundary helpers |
| `createBlockRegExp(content, start?, end?)` | Wraps content with block boundary anchors |
| `createLineRegExp(content, end?, start?)` | Wraps content with line boundary anchors |
| `createWordRegExp(content, start?, end?)` | Wraps content with word boundary anchors |

All three factory functions accept a typed `NamedRegExp<T>` as the content argument and return a correspondingly typed `NamedRegExp<T>` so named captures stay typed end-to-end.

### `internal.ts` — React element symbol

Exports `REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element")`. This is the `$$typeof` symbol React uses to identify valid elements. It is intentionally not re-exported from `shelving/markup` — use `createElement` from `react` in rule render functions instead.

## Usage

Import from `shelving/markup` (the public barrel), not from these files directly. The re-exported symbols include `createMarkupRule`, `MarkupRule`, `MarkupOptions`, `createBlockRegExp`, `createLineRegExp`, `createWordRegExp`, and the regexp constants.

```ts
import {
  createMarkupRule,
  createBlockRegExp,
  BLOCK_CONTENT_REGEXP,
} from "shelving/markup";
```

## See also

- [markup](/markup) — `renderMarkup`, rule arrays, and the full public API
- [markup/rule](/markup/rule) — the built-in rule set
