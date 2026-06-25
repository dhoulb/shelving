import { walkElements } from "../util/element.js";
import { requireSlug } from "../util/string.js";
import type { DocumentationElement, TreeElement } from "../util/tree.js";
import { Extractor } from "./Extractor.js";

/**
 * Input for a `ModuleExtractor`.
 *
 * @see https://shelving.cc/extract/ModuleExtractorInput
 */
export interface ModuleExtractorInput {
	/** Display name for the module, derived from the package.json export key (e.g. `"util/string"`, `"firestore/client"`). */
	readonly name: string;
	/**
	 * The source element this module is built from.
	 * - A file-backed `tree-element` — the module is backed by a single source file (with its `.md` sibling already merged in by `MergingExtractor`).
	 * - A directory-backed `tree-element` — the module is backed by a directory; its absorbed index file provides the content.
	 */
	readonly source: TreeElement;
}

/**
 * Extractor that builds a `kind: "module"` `DocumentationElement` from a source file or directory.
 * - The module's `content`, `description`, and `title` are taken from the source element (`MergingExtractor` and
 *   `IndexExtractor` are expected to have run upstream so `.md` siblings and `README.md` are already folded in).
 * - The module's `children` are every `tree-documentation` element found by deep-walking the source — flattened across
 *   files and subdirectories, but never descending into a `tree-documentation`'s own members.
 *
 * @example const module = new ModuleExtractor().extract({ name: "util/string", source });
 *
 * @see https://shelving.cc/extract/ModuleExtractor
 */
export class ModuleExtractor extends Extractor<ModuleExtractorInput, DocumentationElement> {
	override extract({ name, source }: ModuleExtractorInput): DocumentationElement {
		const children = _collectChildren(source);
		return {
			type: "tree-documentation",
			key: requireSlug(name),
			props: {
				name,
				title: name,
				kind: "module",
				description: source.props.description,
				content: source.props.content,
				children: children.length ? children : undefined,
			},
		};
	}
}

/** Collect every `tree-documentation` element reachable inside `element`, descending through directories and files but not through documented symbols. */
function _collectChildren(element: TreeElement): DocumentationElement[] {
	const result: DocumentationElement[] = [];
	for (const child of walkElements(element.props.children)) {
		const treeChild = child as TreeElement;
		if (treeChild.type === "tree-documentation") {
			result.push(treeChild as DocumentationElement);
		} else if (treeChild.type === "tree-element") {
			result.push(..._collectChildren(treeChild));
		}
	}
	return result;
}
