import { type Elements, getElements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";

/**
 * Deeply iterate a tree of elements and yield the absolute path for each element that has a string `key`.
 * - Paths are formed by concatenating `key` values with `/` separators.
 */
export function* getElementPaths(elements: Elements, prefix = ""): Iterable<AbsolutePath> {
	for (const element of getElements(elements)) {
		const { key } = element;
		if (!key) continue;
		const path = `${prefix}/${key}` as AbsolutePath;
		yield path;
		if (element.props.children) yield* getElementPaths(element.props.children, path);
	}
}
