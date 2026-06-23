import { MARKUP_PARSER } from "../markup/MarkupParser.js";
import { type Element, type Elements, getElementText, walkElements } from "../util/element.js";
import type { TreeElementProps } from "../util/tree.js";
import { FileExtractor } from "./FileExtractor.js";

/**
 * File extractor for Markdown files.
 * - Stores the markdown text as `content`; rendering happens at output time via `<Markup>`.
 * - Sets `title` from the first `# h1` heading if one is present — otherwise leaves it undefined
 *   (a confident title only).
 * - When a `title` is found, strips the leading `# h1` from `content` so renderers (which show
 *   `title` separately) don't display the heading twice.
 * - Sets `description` to the first prose paragraph as a plain-text summary (used for card listings and `<meta>`).
 *
 * @example new MarkupExtractor().extract(Bun.file("/abs/path/README.md"))
 * @see https://shelving.cc/extract/MarkupExtractor
 */
export class MarkupExtractor extends FileExtractor {
	/**
	 * Build the file element props for a Markdown file — storing the text as `content` and deriving `title` and `description`.
	 * - When a `# h1` title is found it is stripped from `content` so it isn't rendered twice.
	 *
	 * @param name The basename of the file without extension.
	 * @param text The raw Markdown source.
	 * @returns The element props with `name`, `content`, and (when present) `title` and `description`.
	 * @example new MarkupExtractor().extractProps("guide", "# Guide\n\nIntro text.")
	 * @see https://shelving.cc/extract/MarkupExtractor/extractProps
	 */
	override extractProps(name: string, text: string): Partial<TreeElementProps> & { name: string } {
		const { title, description } = extractMarkdownProps(text);
		// The title `# h1` is surfaced separately as `title`, so strip it from the body to avoid rendering it twice.
		return { name, title, description, content: title ? _stripTitle(text) : text };
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
 * @example extractMarkdownProps("# Title\n\nSome intro.") // { title: "Title", description: "Some intro." }
 * @see https://shelving.cc/extract/extractMarkdownProps
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

/** Strip a leading `# h1` heading (and any blank lines after it) from markdown text. */
function _stripTitle(text: string): string {
	return text.replace(/^\s*#[^\n\S]+\S[^\n]*(?:\n+|$)/, "");
}
