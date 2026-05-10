import type { FunctionComponent, ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { isArray } from "../../util/array.js";
import { type Element, type ElementProps, getElements, isElement, type PossibleElements } from "../../util/element.js";
import { mapElements } from "../misc/ElementMapper.js";
import type { RouteProps } from "../router/Routes.js";

export interface TreePageProps {
	/** Route params (from the router). */
	params?: RouteProps | undefined;
	/** The root elements to search within. */
	elements?: PossibleElements;
}

/**
 * Resolve a URL path to a tree element and render it.
 * - Splits the `path` route param into segments and walks the tree matching each segment to an element's `key`.
 * - Delegates rendering to the component registered in the element map for `"TreePage.{type}"`.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ params, elements }: TreePageProps): ReactNode {
	const element = _resolveElement(elements, params?.path);
	const [mapped] = mapElements([element], "TreePage");
	if (mapped && typeof mapped.type === "function") {
		const Component = mapped.type as FunctionComponent<ElementProps>;
		return <Component {...mapped.props} />;
	}
	// Fallback: render title and content.
	const title = element.props.title as string | undefined;
	return (
		<>
			{title ? <h1>{title}</h1> : null}
			{element.props.content as ReactNode}
		</>
	);
}

/**
 * Walk a tree of elements to find the one matching the given path.
 * - Each segment of the path is matched against element keys.
 * - Returns the element at the deepest matching level.
 */
function _resolveElement(elements: PossibleElements, path: string | undefined): Element {
	if (!path || path === "/") {
		// Root path — find the first element, or throw.
		for (const el of getElements(elements)) {
			if (el.key) return el;
		}
		throw new NotFoundError("No root element found");
	}

	const segments = path.split("/").filter(Boolean);
	let current: PossibleElements = elements;

	for (const segment of segments) {
		const found = _findChild(current, segment);
		if (!found) throw new NotFoundError(`Element not found: "${segment}"`, { received: path });
		current = found.props.children;
		if (segment === segments[segments.length - 1]) return found;
	}

	throw new NotFoundError("Element not found", { received: path });
}

/** Find a direct child element with a matching key. */
/** Find an immediate child element with a matching key (does not recurse into grandchildren). */
function _findChild(elements: PossibleElements, key: string): Element | undefined {
	if (!elements) return undefined;
	if (isElement(elements)) {
		if (elements.key === key) return elements;
		return _findChild(elements.props.children, key);
	}
	if (isArray(elements)) {
		for (const child of elements) {
			if (isElement(child) && child.key === key) return child;
		}
	} else if (typeof elements === "object" && Symbol.iterator in elements) {
		for (const child of elements as Iterable<Element>) {
			if (child.key === key) return child;
		}
	}
	return undefined;
}
