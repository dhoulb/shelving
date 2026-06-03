import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import type { ImmutableDictionary } from "../util/dictionary.js";
import { splitFileExtension } from "../util/file.js";
import { type AbsolutePath, anyMatch, type Matchables, type Path, requirePath, splitPath } from "../util/index.js";
import type { TreeElement } from "../util/tree.js";
import { Extractor } from "./Extractor.js";
import { FileExtractor } from "./FileExtractor.js";
import { MarkupExtractor } from "./MarkupExtractor.js";
import { TypescriptExtractor } from "./TypescriptExtractor.js";

/** Default file extractor dispatch by extension. */
const DEFAULT_EXTRACTORS: ImmutableDictionary<FileExtractor> = {
	md: new MarkupExtractor(),
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
	/**
	 * Extractor dispatch table keyed by file extension (without the leading dot, e.g. `"md"`).
	 * - Files with no matching extractor are silently skipped.
	 * - Defaults to `.md` (markdown), `.ts` / `.tsx` (TypeScript), and `.txt` (plain text).
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

/**
 * Extractor that walks a directory on disk and produces a tree of `tree-element` nodes.
 * - Recursively descends into subdirectories.
 * - Dispatches non-ignored files to a matching `FileExtractor` based on extension; files with no matching extractor are silently skipped.
 * - Keys on the produced elements are the verbatim filenames (e.g. `"string.ts"`, `"README.md"`) and directory names (e.g. `"util"`).
 * - This is a pure walker: same-key merging and README absorption are intentionally *not* applied here — wrap with `MergingExtractor`
 *   and/or `IndexFileExtractor` to opt in to those behaviours.
 */
export class DirectoryExtractor extends Extractor<Path, TreeElement> {
	private readonly _extractors: ImmutableDictionary<FileExtractor>;
	private readonly _base: AbsolutePath | undefined;
	private readonly _ignore: Matchables;

	constructor({ extractors = DEFAULT_EXTRACTORS, base, ignore = DEFAULT_IGNORE }: DirectoryExtractorOptions = {}) {
		super();
		this._extractors = extractors;
		this._base = base;
		this._ignore = ignore;
	}

	override extract(source: Path): Promise<TreeElement> {
		return this._extractDirectory(requirePath(source, this._base, this.extract));
	}

	private async _extractDirectory(source: AbsolutePath): Promise<TreeElement> {
		const name = splitPath(source).at(-1) ?? "";
		const entries = await readdir(source, { withFileTypes: true });

		const children: TreeElement[] = [];
		for (const entry of entries) {
			if (anyMatch(entry.name, ...this._ignore)) continue;
			const child = await this._extractChild(source, entry);
			if (child) children.push(child);
		}

		return {
			type: "tree-element",
			key: name,
			props: {
				source,
				name,
				children,
			},
		};
	}

	private async _extractChild(base: AbsolutePath, entry: Dirent): Promise<TreeElement | undefined> {
		const name = entry.name;
		const path = requirePath(name, base);
		if (entry.isDirectory()) return this._extractDirectory(path);
		if (entry.isFile()) {
			const [stem, extension] = splitFileExtension(name);
			if (!stem || !extension) return;
			const extractor = this._extractors[extension];
			if (!extractor) return;
			return extractor.extract(Bun.file(path));
		}
	}
}
