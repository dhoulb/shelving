import type { FileElementProps } from "../util/element.js";
import { FileExtractor } from "./FileExtractor.js";

/**
 * File extractor for Markdown files.
 * - Stores the raw markdown text as `content`; rendering happens at output time via `<Markup>`.
 * - Sets `title` from the first `# h1` heading if one is present — otherwise leaves it undefined
 *   (a confident title only).
 * - Sets `description` to the first prose paragraph as a plain-text summary (used for card listings and `<meta>`).
 */
export class MarkdownExtractor extends FileExtractor {
	/** Markdown contributes the canonical title/path when merging same-key elements. */
	override readonly priority = 10;

	override extractProps(name: string, text: string): Partial<FileElementProps> & { name: string } {
		return { name, title: extractMarkdownTitle(text), description: extractMarkdownDescription(text), content: text };
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

/**
 * Find the first prose paragraph in a markdown source string and return it as a plain-text summary, or `undefined` if none.
 * - Skips headings, fenced code blocks, and blank lines, then collects the first ordinary paragraph.
 * - Collapses internal whitespace so the result is a single line suitable for a `description` / `<meta>` summary.
 */
export function extractMarkdownDescription(text: string): string | undefined {
	const paragraph: string[] = [];
	let fenced = false;
	for (const line of text.split("\n")) {
		const trimmed = line.trim();
		// Toggle in/out of fenced code blocks — never treat their contents as the summary.
		if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
			fenced = !fenced;
			continue;
		}
		if (fenced) continue;
		// A blank line or heading ends the first paragraph (or is skipped while still searching for it).
		if (!trimmed || trimmed.startsWith("#")) {
			if (paragraph.length) break;
			continue;
		}
		paragraph.push(trimmed);
	}
	const summary = paragraph.join(" ").replace(/\s+/g, " ").trim();
	return summary || undefined;
}
