import type { Element } from "../../util/element.js";
import { requireSlug } from "../../util/string.js";
import type { ContentExtractor, Extractor } from "./Extractor.js";

/** Options for a file extractor. */
export interface FileExtractorOptions {
	/** Map of file extension (e.g. `".md"`, `".ts"`) to content extractor. */
	readonly extractors: Readonly<Record<string, ContentExtractor>>;
}

/**
 * Extractor that dispatches to a content extractor based on file extension.
 * - Reads the file content and passes it to the matched extractor.
 * - Sets the element `key` to the slugified filename (without extension).
 */
export class FileExtractor implements Extractor<File> {
	private readonly _extractors: Readonly<Record<string, ContentExtractor>>;

	constructor({ extractors }: FileExtractorOptions) {
		this._extractors = extractors;
	}

	async extract(file: File): Promise<Element> {
		const ext = _getExtension(file.name);
		const extractor = ext ? this._extractors[ext] : undefined;
		if (!extractor) return { type: "tree-file", key: requireSlug(_getBaseName(file.name)), props: {} };
		const content = await file.text();
		const element = await extractor.extract(content);
		return { ...element, key: requireSlug(_getBaseName(file.name)) };
	}
}

/** Get the file extension including the dot, e.g. `.ts`. */
function _getExtension(name: string): string | undefined {
	const i = name.lastIndexOf(".");
	return i > 0 ? name.slice(i) : undefined;
}

/** Get the file name without extension, e.g. `array` from `array.ts`. */
function _getBaseName(name: string): string {
	const i = name.lastIndexOf(".");
	return i > 0 ? name.slice(0, i) : name;
}
