import { MARKUP_PARSER } from "../markup/MarkupParser.js";
import { type Element, type Elements, type FileElementProps, getElementText, walkElements } from "../util/element.js";
import { FileExtractor } from "./FileExtractor.js";

/**
 * File extractor for Markdown files.
 * - Stores the raw markdown text as `content`; rendering happens at output time via `<Markup>`.
 * - Sets `title` from the first `# h1` heading if one is present — otherwise leaves it undefined
 *   (a confident title only).
 * - Sets `description` to the first prose paragraph as a plain-text summary (used for card listings and `<meta>`).
 */
export class MarkupExtractor extends FileExtractor {
	/** Markdown contributes the canonical title/path when merging same-key elements. */
	override readonly priority = 10;

	override extractProps(name: string, text: string): Partial<FileElementProps> & { name: string } {
		const { title, description } = extractMarkdownProps(text);
		return { name, title, description, content: text };
	}
}

/**
 * Parse a markdown source string once and derive its `title` and `description` in a single pass.
 * - `title` — plain text of the first `# h1` heading, or `undefined` if there is none.
 * - `description` — plain-text summary of the first prose paragraph, or `undefined` if there is none.
 * - Both query the parsed markup tree, so inline syntax (`` `code` ``, `*emphasis*`, links) resolves to clean plain text.
 *
 * @param text The markdown source string (a markdown file's text, or a JSDoc description).
 * @returns An object whose `title` and `description` are each a plain string, or `undefined` when absent.
 */
export function extractMarkdownProps(text: string): { title: string | undefined; description: string | undefined } {
	let title: string | undefined;
	let description: string | undefined;
	// Walk the top-level block elements once, claiming the first `h1` as the title and the first `p` as the description.
	for (const element of walkElements(MARKUP_PARSER.parse(text) as Elements)) {
		if (!title && element.type === "h1") title = _plain(element);
		else if (!description && element.type === "p") description = _plain(element);
		if (title && description) break;
	}
	return { title, description };
}

/** Flatten an element to a single-line plain-text summary, or `undefined` if it has no text. */
function _plain(element: Element): string | undefined {
	return getElementText(element).replace(/\s+/g, " ").trim() || undefined;
}
