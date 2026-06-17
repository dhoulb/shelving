import type { ImmutableDictionary } from "../util/dictionary.js";
import { walkElements } from "../util/element.js";
import { notNullish } from "../util/null.js";
import { matchTemplate, renderTemplate } from "../util/template.js";
import type { TreeElement } from "../util/tree.js";
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

/**
 * Options for a `MergingExtractor`.
 *
 * @see https://dhoulb.github.io/shelving/extract/MergingExtractor/MergingExtractorOptions
 */
export interface MergingExtractorOptions {
	/**
	 * Templated key pairs that should merge. Each key is a `{base}` template matched against the secondary element's key;
	 * each value is an ordered list of `{base}` templates for the primary candidates to merge into.
	 * - The first primary candidate that exists in the same directory wins; remaining candidates are ignored.
	 * - If no candidate exists the secondary is left in place as its own tree element.
	 * - Defaults to `{ "{base}.md": ["{base}.ts", "{base}.tsx", "{base}.js", "{base}.jsx"] }`.
	 */
	readonly merges?: ImmutableDictionary<readonly string[]>;
}

/**
 * Through extractor that walks a tree of `tree-element` nodes and merges sibling tree elements whose keys match a `merges` template pair.
 * - Purely key-based: it doesn't care whether siblings are directories or files — any element with children is processed, at every level.
 * - **Token-first:** a secondary (e.g. `Card.md`) is preferentially folded into the same-named documentation token declared by a sibling file (the `Card` symbol inside `Card.tsx`), not the file element. Exported names are unique across the package, so this is unambiguous — and it lands the prose on the published symbol page, which survives the module flatten (file-element content does not).
 * - **File fallback:** when no same-named token exists, the secondary folds into a sibling *file* whose key matches a `merges` candidate (whole-file prose like `template.md` → `template.ts`).
 * - The primary (winning) element keeps its `key`, `source`, and `type`; the secondary's `title`, `description`,
 *   `content`, and `children` are folded in via `mergeTreeElements()`.
 * - A secondary with no matching token or file is left in place — pure prose files (e.g. `concepts.md` with no `concepts.ts`) stand alone.
 *
 * @example const extractor = new MergingExtractor(new DirectoryExtractor());
 *
 * @see https://dhoulb.github.io/shelving/extract/MergingExtractor
 */
export class MergingExtractor<I> extends ThroughExtractor<I, TreeElement> {
	private readonly _merges: ImmutableDictionary<readonly string[]>;

	/**
	 * Wrap a source extractor so its produced tree has same-template sibling elements merged.
	 *
	 * @param source Upstream extractor that produces the `tree-element` tree to merge.
	 *
	 * @example const extractor = new MergingExtractor(new DirectoryExtractor());
	 */
	constructor(source: Extractor<I, TreeElement>, { merges = DEFAULT_MERGES }: MergingExtractorOptions = {}) {
		super(source);
		this._merges = merges;
	}

	/**
	 * Extract the source tree and merge same-template sibling elements at every level.
	 *
	 * @param input Input forwarded to the wrapped source extractor.
	 * @returns The source tree with matching sibling elements merged together.
	 *
	 * @example const tree = await new MergingExtractor(source).extract(input);
	 *
	 * @see https://dhoulb.github.io/shelving/extract/MergingExtractor/extract
	 */
	override async extract(input: I): Promise<TreeElement> {
		const root = await this.source.extract(input);
		return _mergeElement(root, this._merges);
	}
}

/** Recursively merge same-template siblings inside `element` and all of its descendants that have children. */
function _mergeElement(element: TreeElement, merges: ImmutableDictionary<readonly string[]>): TreeElement {
	const children = Array.from(walkElements(element.props.children)) as TreeElement[];
	// Recurse into any child that has its own children; childless leaves (e.g. files) are left untouched.
	const merged = _mergeChildren(children, merges).map(child => (notNullish(child.props.children) ? _mergeElement(child, merges) : child));
	return { ...element, props: { ...element.props, children: merged } };
}

/** Merge same-template siblings at one directory level. */
function _mergeChildren(children: readonly TreeElement[], merges: ImmutableDictionary<readonly string[]>): TreeElement[] {
	// Index children by key so we can look up primary file candidates quickly.
	const byKey = new Map<string, TreeElement>();
	for (const child of children) byKey.set(child.key, child);

	// Index exported documentation tokens by name, recording the key of the file element that declares each.
	// Exported names are unique across the package, so a `Foo.md` can target the symbol `Foo` directly.
	const tokensByName = new Map<string, { readonly fileKey: string; readonly token: TreeElement }>();
	for (const child of children) {
		if (child.type !== "tree-element") continue;
		for (const token of walkElements(child.props.children)) {
			const t = token as TreeElement;
			if (t.type === "tree-documentation") tokensByName.set(t.props.name, { fileKey: child.key, token: t });
		}
	}

	// Accumulate token replacements per declaring file: fileKey → (tokenKey → merged token).
	const tokenUpdates = new Map<string, Map<string, TreeElement>>();

	// Walk in original order, deciding for each whether it's a secondary that should fold into a primary.
	const skip = new Set<TreeElement>();
	for (const secondary of children) {
		for (const [lhs, candidates] of Object.entries(merges)) {
			const matches = matchTemplate(lhs, secondary.key);
			if (!matches) continue;

			// Prefer folding a `.md` into the same-named documentation token (e.g. `Card.md` → the `Card` component) so the
			// prose lands on the published symbol page — the module flatten keeps tokens but discards file-element content.
			const base = Object.values(matches)[0];
			const hit = base ? tokensByName.get(base) : undefined;
			if (hit && hit.token !== secondary) {
				const fileMap = tokenUpdates.get(hit.fileKey) ?? new Map<string, TreeElement>();
				fileMap.set(hit.token.key, mergeTreeElements(fileMap.get(hit.token.key) ?? hit.token, secondary));
				tokenUpdates.set(hit.fileKey, fileMap);
				skip.add(secondary);
				break;
			}

			// Otherwise fall back to merging into a sibling file (whole-file prose like `template.md` → `template.ts`).
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

	// Rebuild: drop merged `.md` secondaries, apply file-level merges, and fold token updates into their file elements.
	return children
		.filter(c => !skip.has(c))
		.map(c => {
			const updated = byKey.get(c.key) ?? c;
			const fileMap = tokenUpdates.get(c.key);
			if (!fileMap) return updated;
			const merged = Array.from(walkElements(updated.props.children), child => fileMap.get((child as TreeElement).key) ?? child);
			return { ...updated, props: { ...updated.props, children: merged } };
		});
}
