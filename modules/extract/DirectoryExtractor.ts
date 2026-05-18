import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import type { ImmutableDictionary, MutableDictionary } from "../util/dictionary.js";
import { type DirectoryElement, mergeElements, type TreeElement } from "../util/element.js";
import { splitFileExtension } from "../util/file.js";
import { type AbsolutePath, anyMatch, type Matchables, type Path, requirePath, splitPath } from "../util/index.js";
import { requireSlug } from "../util/string.js";
import { Extractor, mergeTreeElements } from "./Extractor.js";
import { FileExtractor } from "./FileExtractor.js";
import { MarkdownExtractor } from "./MarkdownExtractor.js";
import { TypescriptExtractor } from "./TypescriptExtractor.js";

/**
 * Default list of filenames patterns treated as the directory's index file.
 * - Matched case-insensitively (all entries stored lowercase).
 * - If matched but no extractor is registered for the file's extension, the index is silently skipped.
 */
const DEFAULT_INDEX: Matchables = [/^readme\.txt$/i, /^readme\.md$/i, /^index\.md$/i, /^index\.ts$/i, /^index\.tsx$/i];

/** Default file extractor dispatch by extension. */
const DEFAULT_EXTRACTORS: ImmutableDictionary<FileExtractor> = {
	md: new MarkdownExtractor(),
	ts: new TypescriptExtractor(),
	tsx: new TypescriptExtractor(),
	txt: new FileExtractor(),
};

/**
 * Default ignore patterns.
 * - Skip test and spec files.
 * - Skip `node_modules` directories.
 * - Skip hidden `.` prefixed and underscore-prefixed files and directories.
 */
const DEFAULT_IGNORE: Matchables = [/\.test\.tsx?$/i, /\.spec\.tsx?$/i, /^node_modules$/i, /^[_.]/i];

/** Options for a directory extractor. */
export interface DirectoryExtractorOptions {
	/** Filenames to treat as the directory's index file. Matched case-insensitively. */
	readonly index?: Matchables;
	/**
	 * Extractor dispatch table keyed by file extension (with leading dot, e.g. `".md"`).
	 * - Files with no matching extractor are silently skipped.
	 * - Defaults to `.md` (markdown), `.ts` (TypeScript), and `.txt` (plain text).
	 */
	readonly extractors?: ImmutableDictionary<FileExtractor>;
	/** Absolute base path used to resolve relative paths passed to `extract()`. */
	readonly base?: AbsolutePath;
	/**
	 * Glob patterns for entries to skip — applied to both files and directories.
	 * - Defaults to test and spec files: `["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"]`.
	 * - Hidden entries (`.`-prefixed), underscore-prefixed entries, and `node_modules` are always skipped on top of these patterns.
	 */
	readonly ignore?: Matchables;
}

/** A child element with a priority. */
type ChildData = { element: TreeElement; priority: number };

/**
 * Merge two tree elements, favouring the one with the highest priority.
 * - We merge together elements with the same `key:` (e.g. `TEMPLATE.md` and `template.ts`).
 * - `title` and `description` are taken from the higher-priority element.
 * - `content` and `children` of both elements are merged (with the higher-priority element's content/children first).
 */
function _mergeChild(existing: ChildData | undefined, next: ChildData): ChildData {
	if (!existing) return next;
	return next.priority > existing.priority
		? { element: mergeTreeElements(next.element, existing.element), priority: next.priority }
		: { element: mergeTreeElements(existing.element, next.element), priority: existing.priority };
}

/**
 * Extractor that walks a directory on disk and produces a `DirectoryElement` tree.
 * - Recursively descends into subdirectories.
 * - Detects an index file (e.g. `README.md`) and absorbs its content/description/title as the directory's own.
 * - Dispatches non-index files to a matching `FileExtractor` based on extension; files with no matching extractor are silently skipped.
 * - Merges file elements that share the same `key` (e.g. `TEMPLATE.md` and `template.ts`) using each extractor's `priority`.
 * - Throws if a directory and a file (or two directories) share the same `key`.
 */
export class DirectoryExtractor extends Extractor<Path, DirectoryElement> {
	private readonly _indexes: Matchables;
	private readonly _extractors: ImmutableDictionary<FileExtractor>;
	private readonly _base: AbsolutePath | undefined;
	private readonly _ignore: Matchables;

	constructor({ index = DEFAULT_INDEX, extractors = DEFAULT_EXTRACTORS, base, ignore = DEFAULT_IGNORE }: DirectoryExtractorOptions = {}) {
		super();
		this._indexes = index;
		this._extractors = extractors;
		this._base = base;
		this._ignore = ignore;
	}

	override extract(source: Path): Promise<DirectoryElement> {
		return this._extractDirectory(requirePath(source, this._base, this.extract));
	}

	private async _extractDirectory(source: AbsolutePath): Promise<DirectoryElement> {
		const name = splitPath(source).at(-1) ?? "";
		const entries = await readdir(source, { withFileTypes: true });

		// Keep track of the current index entry and children by key, so we can merge same-key elements.
		let index: ChildData | undefined;
		const items: MutableDictionary<ChildData> = {};

		for (const entry of entries) {
			// Should we ignore this entry?
			if (anyMatch(entry.name, ...this._ignore)) continue;

			// Extract the child element and possibly merge it.
			const child = await this._extractChild(source, entry);
			if (child) {
				// Is this entry an index? If so, we'll treat it as the directory itself and merge it with any existing index entry if needed.
				if (anyMatch(entry.name, ...this._indexes)) {
					index = _mergeChild(index, child);
				} else {
					const key = child.element.key;
					items[key] = _mergeChild(items[key], child);
				}
			}
		}

		const children = Object.values(items).map(({ element }) => element);

		return {
			type: "tree-directory",
			key: requireSlug(name),
			props: {
				source,
				name,
				// `title` is only set when the absorbed index file has a confident one (e.g. README H1).
				// Renderers fall back to `name` otherwise.
				title: index?.element.props.title,
				description: index?.element.props.description,
				content: index?.element.props.content,
				children: mergeElements(index?.element.props.children, children),
			},
		};
	}

	private async _extractChild(base: AbsolutePath, entry: Dirent): Promise<ChildData | undefined> {
		const name = entry.name;
		const path = requirePath(name, base);
		if (entry.isDirectory()) {
			return {
				element: await this._extractDirectory(path),
				priority: this.priority,
			};
		} else if (entry.isFile()) {
			const [base, extension] = splitFileExtension(name);
			if (!base || !extension) return; // Skip files with no base name or extension.
			const extractor = this._extractors[extension];
			if (!extractor) return; // Skip files with no registered extractor (including non-matching index files).
			return {
				element: await extractor.extract(Bun.file(path)),
				priority: extractor.priority,
			};
		}
	}
}
