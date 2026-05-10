import type { Element } from "../util/element.js";
import { requireSlug } from "../util/string.js";
import { Extractor } from "./Extractor.js";
import type { FileExtractor } from "./FileExtractor.js";

/** Options for a directory extractor. */
export interface DirectoryExtractorOptions {
	/** Filenames to treat as the directory's index file (e.g. `["README.md", "INDEX.md"]`). */
	readonly index: readonly string[];
	/** Extractor to use for child files. */
	readonly extractor: FileExtractor;
}

/**
 * Extractor that processes a directory's files into a directory element.
 * - Finds an index file and absorbs its content as the directory's own content.
 * - Delegates remaining files to the child file extractor.
 * - Errors if two child elements resolve to the same slug.
 * - Preserves file system ordering.
 */
export class DirectoryExtractor extends Extractor<{ name: string; files: File[] }> {
	private readonly _index: readonly string[];
	private readonly _extractor: FileExtractor;

	constructor({ index, extractor }: DirectoryExtractorOptions) {
		super();
		this._index = index;
		this._extractor = extractor;
	}

	async extract({ name, files }: { name: string; files: File[] }): Promise<Element> {
		let indexElement: Element | undefined;
		const children: Element[] = [];
		const keys = new Set<string>();

		for (const file of files) {
			if (!indexElement && this._index.includes(file.name)) {
				indexElement = await this._extractor.extract(file);
			} else {
				const element = await this._extractor.extract(file);
				const { key } = element;
				if (key) {
					if (keys.has(key)) throw new Error(`Duplicate key "${key}" in directory "${name}"`);
					keys.add(key);
				}
				children.push(element);
			}
		}

		return {
			type: "tree-directory",
			key: requireSlug(name),
			props: {
				title: (indexElement?.props.title as string | undefined) ?? name,
				description: indexElement?.props.description as string | undefined,
				content: indexElement?.props.content,
				children,
			},
		};
	}
}
