import type { BunFile } from "bun";
import type { FileElement } from "../util/element.js";
import { splitFileExtension } from "../util/file.js";
import { requireSlug } from "../util/string.js";
import { Extractor } from "./Extractor.js";

/**
 * Base extractor for a file in a tree.
 * - Reads the file's content as text and stores it in `content`.
 * - Sets `key` to the slugified basename (without extension) and `title` to the unslugged basename.
 * - Sets `path` to the file's absolute path if known.
 * - Subclasses (e.g. `MarkdownExtractor`, `TypescriptExtractor`) override `extract()` to parse the content into richer elements.
 */
export class FileExtractor extends Extractor<BunFile, FileElement> {
	async extract(file: BunFile): Promise<FileElement> {
		const { name = "unnamed.txt" } = file;
		const [title = name] = splitFileExtension(file.name);

		return {
			type: "tree-file",
			key: requireSlug(title),
			props: {
				name,
				title,
				content: await file.text(),
			},
		};
	}
}
