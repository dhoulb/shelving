import type { MarkupRules } from "../util/rule.js";
import { BLOCKQUOTE_RULE } from "./blockquote.js";
import { CODE_RULE } from "./code.js";
import { FENCED_RULE } from "./fenced.js";
import { HEADING_RULE } from "./heading.js";
import { INLINE_RULE } from "./inline.js";
import { LINEBREAK_RULE } from "./linebreak.js";
import { AUTOLINK_RULE, LINK_RULE } from "./link.js";
import { ORDERED_RULE } from "./ordered.js";
import { PARAGRAPH_RULE } from "./paragraph.js";
import { SEPARATOR_RULE } from "./separator.js";
import { UNORDERED_RULE } from "./unordered.js";

/** Markup rules that work in a block context. */
export const MARKUP_RULES_BLOCK: MarkupRules = [
	FENCED_RULE,
	HEADING_RULE,
	SEPARATOR_RULE,
	UNORDERED_RULE,
	ORDERED_RULE,
	BLOCKQUOTE_RULE,
	PARAGRAPH_RULE,
];

/** Markup rules that work in an inline context. */
export const MARKUP_RULES_INLINE: MarkupRules = [CODE_RULE, LINK_RULE, AUTOLINK_RULE, INLINE_RULE, LINEBREAK_RULE];

/**
 * Default markup rules
 *
 * These rules define a syntax similar to Markdown but with improvements:
 * 1. Syntax is more intuitive (e.g. `*strong*` always uses `*` asterisk and `_em_` always uses `_` underscore, and URLs are always autolinked).
 * 2. More compatible with textboxes that wrap lines by default (e.g. single `\n` linebreaks don't need the trailing double space to, they're always treated as `<br />`).
 * 3. Don't support fussy fragile syntax that lets users make mistakes (e.g. literal HTML tags or `&amp;` character entities).
 *
 * @todo Default rules support "list items containing paragraphs" syntax (CommonMark calls this loose lists).
 *   - i.e. Lists can include `\n\n` double line breaks, and wrap all their contents in `<p>` entities, i.e. childContext is "block"
 *   - Hard because you have to capture the entire list including `\n\n`, so there's no obvious place to end it.
 *   - If there are breaks then any sub-lines need to be indented by two or more spaces otherwise it will break the list.
 *   - Make reference lists support this loose format too.
 * @todo [ ] Default rules support tables using `|` pipe syntax.
 * @todo [ ] Default rules support todo lists using `- [x]` syntax.
 * @todo [ ] Default rules support new reference syntax (combines reference lists/sidenotes/footnotes/reference and produces <dl> syntax).
 *   - All of these can be the same because reference links and Extended Markdown footnotes are basically the same.
 *   - e.g. `[Google Maps][1]` → `[1]: http://google.com Content goes here` (Markdown reference link syntax).
 *   - e.g. `[Google Maps]` → `[Google Maps]: http://google.com Content goes here` syntax.
 *   - e.g. `[DNS]` → `[DNS]: Domain Name System (extended Markdown definition list format).
 *   - If a `[Reference]` does not correspond to anything it will not be linked and e.g. will appear unlinked.
 *   - Single/double quotes around definition part are optional and are trimmed from the start/end (Extended Markdown definition lists require quotes, but that's dumb).
 *   - A `<dl>` definition list is used as the output format for all of these different use cases.
 *   - If the first thing in the definition is a URL, then it's recognised as a link reference (and produces an `<a href=""></a>`)
 *   - If the first thing in the definition isn't a URL, then it's recognised as a sidenote/footnote and tapping it will scroll you to that point (and popup the definition like Marco Arment's Bigfoot code).
 */
export const MARKUP_RULES: MarkupRules = [...MARKUP_RULES_BLOCK, ...MARKUP_RULES_INLINE];

export * from "./blockquote.js";
export * from "./code.js";
export * from "./fenced.js";
export * from "./heading.js";
export * from "./inline.js";
export * from "./linebreak.js";
export * from "./link.js";
export * from "./link.js";
export * from "./ordered.js";
export * from "./paragraph.js";
export * from "./separator.js";
export * from "./unordered.js";
