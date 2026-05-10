import { renderMarkup } from "../markup/render.js";
import { MARKUP_RULES } from "../markup/rule/index.js";
import type { MarkupOptions } from "../markup/util/options.js";
import type { Element, Elements } from "../util/element.js";
import { getElements, getElementText } from "../util/element.js";
import type { ContentExtractor } from "./Extractor.js";

/**
 * Extractor that converts a Markdown string into a file element.
 * - Parses the markdown using the markup module.
 * - Extracts the first `<h1>` heading as the element title.
 */
export class MarkdownExtractor implements ContentExtractor {
	private readonly _options: MarkupOptions;

	constructor(options: MarkupOptions = { rules: MARKUP_RULES }) {
		this._options = options;
	}

	extract(content: string): Element {
		const elements = renderMarkup(content, this._options);
		const title = _getFirstHeadingText(elements);
		return {
			type: "tree-file",
			key: null,
			props: { title, content: elements },
		};
	}
}

/** Find the first `h1` element and extract its text content. */
function _getFirstHeadingText(elements: Elements): string | undefined {
	for (const el of getElements(elements)) {
		if (el.type === "h1") return getElementText(el.props.children) || undefined;
	}
}
