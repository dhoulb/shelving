import type { ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type Element, type Elements, getElements, isElement } from "../../util/element.js";
import type { RouteProps } from "../router/Routes.js";
import { useElementComponent } from "./ElementContext.js";

export interface TreePageProps {
	/** Route params (from the router). */
	params?: RouteProps | undefined;
	/** The root elements to search within. */
	elements?: Elements;
}

/**
 * Resolve a URL path to a tree element and render it.
 * - Splits the `path` route param into segments and walks the tree matching each segment to an element's `key`.
 * - Delegates rendering to the component registered in `ElementContext` for `"page.{type}"`.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ params, elements }: TreePageProps): ReactNode {
	const element = _resolveElement(elements, params?.path);
	return <TreePageElement element={element} />;
}

function TreePageElement({ element }: { element: Element }): ReactNode {
	const Component = useElementComponent("page", element.type as string);
	if (Component) return <Component element={element}>{element.props.children}</Component>;
	// Fallback: render title and children.
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
function _resolveElement(elements: Elements, path: string | undefined): Element {
	if (!path || path === "/") {
		// Root path — find the first element, or throw.
		for (const el of getElements(elements)) {
			if (el.key) return el;
		}
		throw new NotFoundError("No root element found");
	}

	const segments = path.split("/").filter(Boolean);
	let current: Elements = elements;

	for (const segment of segments) {
		const found = _findChild(current, segment);
		if (!found) throw new NotFoundError(`Element not found: "${segment}"`, { received: path });
		current = found.props.children;
		if (segment === segments[segments.length - 1]) return found;
	}

	throw new NotFoundError("Element not found", { received: path });
}

/** Find a direct child element with a matching key. */
function _findChild(elements: Elements, key: string): Element | undefined {
	if (!elements) return undefined;
	if (isElement(elements)) {
		if (elements.key === key) return elements;
		// Search immediate children.
		return _findChild(elements.props.children, key);
	}
	if (Array.isArray(elements)) {
		for (const child of elements) {
			if (isElement(child) && child.key === key) return child;
		}
	}
	return undefined;
}
