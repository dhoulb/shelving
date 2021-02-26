import type { MarkupNode } from "./types";

/**
 * Take a JSX node and strip all tags from it to produce a plain text string.
 * - Equivalent to the `DOMElement.textContent` property on an HTML DOM node.
 * - Should work (but not tested) on any `React.Element` instance too.
 *
 * @param node A JsxNode, e.g. either a JSX element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the JSX node.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export const markupToString = (node: MarkupNode): string => {
	if (typeof node === "string") return node;
	if (node instanceof Array) return node.map(markupToString).join(" ");
	if (typeof node === "object" && node) return markupToString(node.props.children);
	return "";
};

// Regular expressions used for preprocessing.
const ROGUE_WHITESPACE = /[^\S\n ]/g; // Match whitespace that isn't "\n" line feed or ` ` space (includes tabs).
const ROGUE_PARAGRAPHS = /\u2029/g; // Match newlines that use "\r".
const ROGUE_NEWLINES = /\r\n?|\u2028/g; // Match newlines that use "\r".
const TRAILING_SPACES = / +$/gm; // Match trailing spaces on a line.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x09\x0B-\x1F\x7F-\x9F]/g; // Match all control characters (00-1F, 7F-9F) except `\x0A` `\n` line feed (security).

/**
 * Clean an input string.
 * - Allows our future RegExps to be less fussy (e.g. allowing for whitespace at the end of lines).
 * - Converts tabs and any other rogue whitespace (line feeds, obscure Unicode things) to whitespaces.
 */
export const cleanMarkup = (content: string): string =>
	content
		.replace(ROGUE_PARAGRAPHS, "\n\n") // Change weird new paragraph separators to standard "\n\n"
		.replace(ROGUE_NEWLINES, "\n") // Change weird newlines to standard "\n"
		.replace(ROGUE_WHITESPACE, " ") // Change obscure whitespace characters (e.g. tab and line-feed) to whitespace.
		.replace(TRAILING_SPACES, "") // Strip trailing whitespaces on any lines.
		.replace(CONTROL_CHARS, "") // Strip trailing spaces on any lines.
		.trimStart(); // Trim the start (including leading newlines).
