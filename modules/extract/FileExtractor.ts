import type { BunFile } from "bun";
import type { FileElement, FileElementProps } from "../util/element.js";
import { splitFileExtension } from "../util/file.js";
import { isAbsolutePath, splitAbsolutePath } from "../util/index.js";
import { requireSlug } from "../util/string.js";
import { Extractor } from "./Extractor.js";

/**
 * Base extractor for a file in a tree.
 * - Reads the file's content as text and stores it in `content`.
 * - Sets `key` to the slugified basename without extension.
 * - Sets `name` to the display-ready basename without extension (e.g. `"OptionalSchema"`, not `"OptionalSchema.ts"`).
 * - Does NOT set `title` — `title` is only set by subclasses that have a confident source for one
 *   (e.g. `MarkdownExtractor` uses the first `<h1>`). Renderers fall back to `name` when missing.
 * - Subclasses (e.g. `MarkdownExtractor`, `TypescriptExtractor`) override `extractProps()` to parse the content into richer elements.
 */
export class FileExtractor extends Extractor<BunFile, FileElement> {
	async extract(file: BunFile): Promise<FileElement> {
		const path = file.name ?? "unnamed";
		const filename = isAbsolutePath(path) ? (splitAbsolutePath(path).at(-1) ?? "unnamed") : path;
		const [base = filename] = splitFileExtension(filename);

		return {
			type: "tree-file",
			key: requireSlug(base),
			props: this.extractProps(base, await file.text()),
		};
	}

	/**
	 * Build the file element props from the extracted content.
	 * - `name` is the basename without extension (e.g. `"array"`) — display-ready, used by menus and cards.
	 * - Override to parse `text` into richer elements (content/children/description) and to set
	 *   `title` if a confident title is available.
	 */
	extractProps(name: string, content: string): FileElementProps {
		return { name, content };
	}
}
