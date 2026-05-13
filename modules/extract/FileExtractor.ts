import type { BunFile } from "bun";
import type { FileElement, FileElementProps } from "../util/element.js";
import { splitFileExtension } from "../util/file.js";
import { isAbsolutePath, splitAbsolutePath } from "../util/index.js";
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
		const path = file.name ?? "unnamed";
		const name = isAbsolutePath(path) ? (splitAbsolutePath(path).at(-1) ?? "unnamed") : path;
		const [title = name] = splitFileExtension(name);

		return {
			type: "tree-file",
			key: requireSlug(title),
			props: this.extractProps(name, title, await file.text()),
		};
	}

	extractProps(name: string, title: string, content: string): FileElementProps {
		return { name, title, content };
	}
}
