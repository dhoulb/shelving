import { renderMarkup } from "../markup/render.js";
import { MARKUP_RULES } from "../markup/rule/index.js";
import type { MarkupOptions } from "../markup/util/options.js";
import type { Elements, FileElementProps } from "../util/element.js";
import { getElements, getElementText } from "../util/element.js";
import { FileExtractor } from "./FileExtractor.js";

/**
 * File extractor that parses a Markdown file into a tree element.
 * - Parses the file content using the markup module.
 * - Uses the first `<h1>` heading as the element title (falling back to the filename).
 */
export class MarkdownExtractor extends FileExtractor {
	/** Markdown contributes the canonical title/path when merging same-key elements. */
	override readonly priority = 10;

	private readonly _options: MarkupOptions;

	constructor(options: MarkupOptions = { rules: MARKUP_RULES }) {
		super();
		this._options = options;
	}

	override extractProps(name: string, base: string, text: string): FileElementProps {
		const content = this.render(text);
		const title = _getFirstHeadingText(content) ?? base;
		return { name, title, content };
	}

	render(text: string): Elements {
		return renderMarkup(text, this._options);
	}
}

/** Find the first `h1` element and extract its text content. */
function _getFirstHeadingText(markdown: Elements): string | undefined {
	for (const el of getElements(markdown)) if (el.type === "h1") return getElementText(el.props.children) || undefined;
}
