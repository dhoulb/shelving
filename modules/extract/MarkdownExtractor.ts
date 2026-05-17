import type { FileElementProps } from "../util/element.js";
import { FileExtractor } from "./FileExtractor.js";

/**
 * File extractor for Markdown files.
 * - Stores the raw markdown text as `content`; rendering happens at output time via `<Markup>`.
 * - Sets `title` from the first `# h1` heading if one is present — otherwise leaves it undefined
 *   (a confident title only).
 */
export class MarkdownExtractor extends FileExtractor {
	/** Markdown contributes the canonical title/path when merging same-key elements. */
	override readonly priority = 10;

	override extractProps(name: string, text: string): FileElementProps {
		return { name, title: extractMarkdownTitle(text), content: text };
	}
}

/**
 * Find the first `# h1` heading in a markdown source string and return its text, or `undefined` if none.
 * - Looks for a line starting with a single `#` followed by whitespace; doesn't match `##`+.
 */
export function extractMarkdownTitle(text: string): string | undefined {
	const match = text.match(/^#\s+(.+?)\s*$/m);
	return match?.[1];
}
