import type { MarkupRules } from "../MarkupRule.js";
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
import { TABLE_RULE } from "./table.js";
import { UNORDERED_RULE } from "./unordered.js";

/**
 * Default markup rules that render in a block context — fenced code, headings, separators, lists, blockquotes, tables, and paragraphs.
 *
 * @example new MarkupParser({ rules: MARKUP_RULES_BLOCK })
 * @see https://dhoulb.github.io/shelving/markup/rule/MARKUP_RULES_BLOCK
 */
export const MARKUP_RULES_BLOCK: MarkupRules = [
	FENCED_RULE,
	HEADING_RULE,
	SEPARATOR_RULE,
	UNORDERED_RULE,
	ORDERED_RULE,
	BLOCKQUOTE_RULE,
	TABLE_RULE,
	PARAGRAPH_RULE,
];

/**
 * Default markup rules that render in an inline context — inline code, links, autolinks, emphasis, and hard linebreaks.
 *
 * @example new MarkupParser({ rules: MARKUP_RULES_INLINE })
 * @see https://dhoulb.github.io/shelving/markup/rule/MARKUP_RULES_INLINE
 */
export const MARKUP_RULES_INLINE: MarkupRules = [
	CODE_RULE, //
	LINK_RULE,
	AUTOLINK_RULE,
	INLINE_RULE,
	LINEBREAK_RULE,
];

/**
 * Default markup rules — the combined block and inline rules [`MarkupParser`](/markup/MarkupParser) uses when none are supplied.
 *
 * These rules define a syntax similar to Markdown but with improvements:
 * 1. Syntax is more intuitive (e.g. `*strong*` always uses `*` asterisk and `_em_` always uses `_` underscore, and URLs are always autolinked).
 * 2. More compatible with textboxes that wrap lines by default (e.g. single `\n` linebreaks don't need the trailing double space to, they're always treated as `<br />`).
 * 3. Don't support fussy fragile syntax that lets users make mistakes (e.g. literal HTML tags or `&amp;` character entities).
 *
 * @example new MarkupParser({ rules: MARKUP_RULES }).parse("This is a *bold* string.")
 * @see https://dhoulb.github.io/shelving/markup/rule/MARKUP_RULES
 */
export const MARKUP_RULES: MarkupRules = [
	...MARKUP_RULES_BLOCK, //
	...MARKUP_RULES_INLINE,
];

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
export * from "./table.js";
export * from "./unordered.js";
