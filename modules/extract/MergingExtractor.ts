import type { ImmutableDictionary } from "../util/dictionary.js";
import { type DirectoryElement, type TreeElement, walkElements } from "../util/element.js";
import { matchTemplate, renderTemplate } from "../util/template.js";
import type { Extractor } from "./Extractor.js";
import { mergeTreeElements } from "./Extractor.js";
import { ThroughExtractor } from "./ThroughExtractor.js";

/**
 * Default merges map: a markdown file is absorbed into its same-base TypeScript counterpart.
 * - Key (secondary) and values (primary candidates) are `{base}`-templated key strings.
 * - Candidates are checked in order — the first one that exists in the tree wins.
 * - A secondary with no matching primary is left in place as its own element.
 */
const DEFAULT_MERGES: ImmutableDictionary<readonly string[]> = {
	"{base}.md": ["{base}.ts", "{base}.tsx", "{base}.js", "{base}.jsx"],
};

/** Options for a `MergingExtractor`. */
export interface MergingExtractorOptions {
	/**
	 * Templated key pairs that should merge. Each key is a `{base}` template matched against the secondary element's key;
	 * each value is an ordered list of `{base}` templates for the primary candidates to merge into.
	 * - The first primary candidate that exists in the same directory wins; remaining candidates are ignored.
	 * - If no candidate exists the secondary is left in place as its own tree-file element.
	 * - Defaults to `{ "{base}.md": ["{base}.ts", "{base}.tsx", "{base}.js", "{base}.jsx"] }`.
	 */
	readonly merges?: ImmutableDictionary<readonly string[]>;
}

/**
 * Through extractor that walks a `DirectoryElement` tree and merges sibling tree elements whose keys match a `merges` template pair.
 * - Walks every directory recursively, applying the merge at each level.
 * - The primary (winning) element keeps its `key`, `source`, and `type`; the secondary's `title`, `description`,
 *   `content`, and `children` are folded in via `mergeTreeElements()`.
 * - A secondary with no matching primary is left in place — pure prose files (e.g. `concepts.md` with no `concepts.ts`) stand alone.
 */
export class MergingExtractor<I> extends ThroughExtractor<I, DirectoryElement> {
	private readonly _merges: ImmutableDictionary<readonly string[]>;

	constructor(source: Extractor<I, DirectoryElement>, { merges = DEFAULT_MERGES }: MergingExtractorOptions = {}) {
		super(source);
		this._merges = merges;
	}

	override async extract(input: I): Promise<DirectoryElement> {
		const root = await this.source.extract(input);
		return _mergeDirectory(root, this._merges);
	}
}

/** Recursively merge same-template siblings inside `dir` and all nested directories. */
function _mergeDirectory(dir: DirectoryElement, merges: ImmutableDictionary<readonly string[]>): DirectoryElement {
	const children = Array.from(walkElements(dir.props.children)) as TreeElement[];
	const merged = _mergeChildren(children, merges).map(child =>
		child.type === "tree-directory" ? _mergeDirectory(child as DirectoryElement, merges) : child,
	);
	return { ...dir, props: { ...dir.props, children: merged } };
}

/** Merge same-template siblings at one directory level. */
function _mergeChildren(children: readonly TreeElement[], merges: ImmutableDictionary<readonly string[]>): TreeElement[] {
	// Index children by key so we can look up primary candidates quickly.
	const byKey = new Map<string, TreeElement>();
	for (const child of children) byKey.set(child.key, child);

	// Walk in original order, deciding for each whether it's a secondary that should fold into a primary.
	const skip = new Set<TreeElement>();
	for (const secondary of children) {
		for (const [lhs, candidates] of Object.entries(merges)) {
			const matches = matchTemplate(lhs, secondary.key);
			if (!matches) continue;
			for (const rhs of candidates) {
				const primaryKey = renderTemplate(rhs, matches);
				const primary = byKey.get(primaryKey);
				if (!primary || primary === secondary) continue;
				byKey.set(primaryKey, mergeTreeElements(primary, secondary));
				skip.add(secondary);
				break;
			}
			if (skip.has(secondary)) break;
		}
	}

	return children.filter(c => !skip.has(c)).map(c => byKey.get(c.key) ?? c);
}
