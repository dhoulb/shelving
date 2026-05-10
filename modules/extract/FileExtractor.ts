import type { Element } from "../util/element.js";
import { splitFileExtension } from "../util/file.js";
import { requireSlug } from "../util/string.js";
import { type ContentExtractor, Extractor } from "./Extractor.js";

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
export class FileExtractor extends Extractor<File> {
	private readonly _extractors: Readonly<Record<string, ContentExtractor>>;

	constructor({ extractors }: FileExtractorOptions) {
		super();
		this._extractors = extractors;
	}

	async extract(file: File): Promise<Element> {
		const [base, ext] = splitFileExtension(file.name);
		const key = requireSlug(base ?? file.name);
		const extractor = ext ? this._extractors[ext] : undefined;
		if (!extractor) return { type: "tree-file", key, props: {} };
		const content = await file.text();
		const element = await extractor.extract(content);
		return { ...element, key };
	}
}
