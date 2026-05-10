import type { FunctionComponent, ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type Element, type ElementProps, getElements, type PossibleElements } from "../../util/element.js";
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

/** Walk a path like `"util/array"` through a tree, matching each segment to an element key. */
function _resolveElement(elements: PossibleElements, path: string | undefined): Element {
	const segments = (path || "").split("/").filter(Boolean);

	if (!segments.length) {
		// Root — return the first keyed element.
		for (const el of getElements(elements, 0)) {
			if (el.key) return el;
		}
		throw new NotFoundError("No root element found");
	}

	let current: PossibleElements = elements;
	let found: Element | undefined;

	for (const segment of segments) {
		found = undefined;
		for (const el of getElements(current, 0)) {
			if (el.key === segment) {
				found = el;
				break;
			}
		}
		if (!found) throw new NotFoundError(`Element not found: "${segment}"`, { received: path });
		current = found.props.children;
	}

	if (!found) throw new NotFoundError("Element not found", { received: path });
	return found;
}
