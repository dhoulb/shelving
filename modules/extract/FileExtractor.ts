import type { BunFile } from "bun";
import { RequiredError } from "../error/RequiredError.js";
import { splitFileExtension } from "../util/file.js";
import { isAbsolutePath, splitPath } from "../util/index.js";
import type { TreeElement, TreeElementProps } from "../util/tree.js";
import { Extractor } from "./Extractor.js";

/**
 * Base extractor for a file in a tree.
 * - Reads the file's content as text and stores it in `content`.
 * - Sets `source` to the file's absolute path (`BunFile.name`); throws `RequiredError` if missing or non-absolute.
 * - Sets `name` to the basename without extension, preserving case (e.g. `"OptionalSchema"` from `"OptionalSchema.ts"`); URL paths use `name`.
 * - Sets `key` to the verbatim filename including extension (e.g. `"OptionalSchema.ts"`). Keys are unique within a directory
 *   and used by `MergingExtractor` to pair siblings (`{base}.md` + `{base}.ts`) and by `PackageExtractor` to look up sources.
 * - Does NOT set `title` — `title` is only set by subclasses that have a confident source for one (e.g. `MarkupExtractor` uses the first `<h1>`). Renderers fall back to `name` when missing.
 * - Subclasses (e.g. `MarkupExtractor`, `TypescriptExtractor`) override `extractProps()` to parse the content into richer elements.
 *
 * @example new FileExtractor().extract(Bun.file("/abs/path/notes.txt"))
 * @see https://dhoulb.github.io/shelving/extract/FileExtractor/FileExtractor
 */
export class FileExtractor extends Extractor<BunFile, TreeElement> {
	/**
	 * Read a file and build a `tree-element` from its text content.
	 *
	 * @param file The Bun file to read; its `name` must be an absolute path.
	 * @returns A promise resolving to the file's `tree-element`, keyed by its verbatim filename.
	 * @throws RequiredError If the file has no name or its path is not absolute.
	 * @example await new FileExtractor().extract(Bun.file("/abs/path/notes.txt"))
	 * @see https://dhoulb.github.io/shelving/extract/FileExtractor/FileExtractor/extract
	 */
	async extract(file: BunFile): Promise<TreeElement> {
		const source = file.name;
		if (!source || !isAbsolutePath(source)) throw new RequiredError("FileExtractor requires an absolute file path", { received: source });
		const filename = splitPath(source).at(-1) ?? "unnamed";
		const [base = filename] = splitFileExtension(filename);

		const text = await file.text();
		const props: TreeElementProps = { ...this.extractProps(base, text), source };
		return {
			type: "tree-element",
			key: filename,
			props,
		};
	}

	/**
	 * Build the file element props from the extracted content.
	 * - `name` is the basename without extension (e.g. `"array"`) — display-ready, used by menus, cards, and URL paths.
	 * - Override to parse `text` into richer elements (content/children/description) and to set
	 *   `title` if a confident title is available.
	 *
	 * @param name The basename of the file without extension (e.g. `"array"`).
	 * @param content The raw text content of the file.
	 * @returns The element props, always including a `name`; the base implementation stores `content` verbatim.
	 * @example extractProps("notes", "Some text") // { name: "notes", content: "Some text" }
	 * @see https://dhoulb.github.io/shelving/extract/FileExtractor/FileExtractor/extractProps
	 */
	extractProps(name: string, content: string): Partial<TreeElementProps> & { name: string } {
		return { name, content };
	}
}
