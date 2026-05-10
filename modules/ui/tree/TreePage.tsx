import type { FunctionComponent, ReactNode } from "react";
import { NotFoundError } from "../../error/RequestError.js";
import { type ElementProps, type PossibleElements, resolveElementPath } from "../../util/element.js";
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
 * - Uses `resolveElementPath()` to walk the tree matching each path segment to an element's `key`.
 * - Delegates rendering to the component registered in the element map for `"TreePage.{type}"`.
 * - Throws `NotFoundError` if no element matches at any level.
 */
export function TreePage({ params, elements }: TreePageProps): ReactNode {
	const element = resolveElementPath(elements, params?.path);
	if (!element) throw new NotFoundError("Element not found", { received: params?.path });
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
