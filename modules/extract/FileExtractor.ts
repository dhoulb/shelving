import type { BunFile } from "bun";
import { RequiredError } from "../error/RequiredError.js";
import type { FileElement, FileElementProps } from "../util/element.js";
import { splitFileExtension } from "../util/file.js";
import { isAbsolutePath, splitPath } from "../util/index.js";
import { requireSlug } from "../util/string.js";
import { Extractor } from "./Extractor.js";

/**
 * Base extractor for a file in a tree.
 * - Reads the file's content as text and stores it in `content`.
 * - Sets `source` to the file's absolute path (`BunFile.name`); throws `RequiredError` if missing or non-absolute.
 * - Sets `name` to the basename without extension, preserving case (e.g. `"OptionalSchema"` from `"OptionalSchema.ts"`); URL paths use `name`.
 * - Sets `key` to the slugified `name` (e.g. `"optionalschema"`) — only used by React for reconciliation and by `DirectoryExtractor` to merge same-key siblings (e.g. `TEMPLATE.md` + `template.ts`).
 * - Does NOT set `title` — `title` is only set by subclasses that have a confident source for one (e.g. `MarkupExtractor` uses the first `<h1>`). Renderers fall back to `name` when missing.
 * - Subclasses (e.g. `MarkupExtractor`, `TypescriptExtractor`) override `extractProps()` to parse the content into richer elements.
 */
export class FileExtractor extends Extractor<BunFile, FileElement> {
	async extract(file: BunFile): Promise<FileElement> {
		const source = file.name;
		if (!source || !isAbsolutePath(source)) throw new RequiredError("FileExtractor requires an absolute file path", { received: source });
		const filename = splitPath(source).at(-1) ?? "unnamed";
		const [base = filename] = splitFileExtension(filename);

		const text = await file.text();
		const props: FileElementProps = { ...this.extractProps(base, text), source };
		return {
			type: "tree-file",
			key: requireSlug(base),
			props,
		};
	}

	/**
	 * Build the file element props from the extracted content.
	 * - `name` is the basename without extension (e.g. `"array"`) — display-ready, used by menus, cards, and URL paths.
	 * - Override to parse `text` into richer elements (content/children/description) and to set
	 *   `title` if a confident title is available.
	 */
	extractProps(name: string, content: string): Partial<FileElementProps> & { name: string } {
		return { name, content };
	}
}
