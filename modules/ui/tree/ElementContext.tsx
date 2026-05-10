import { createContext, type ReactNode, use } from "react";
import type { Element, Elements } from "../../util/element.js";

/**
 * A component that renders a tree element.
 * - Receives the element and its children elements as props.
 */
export type ElementComponent = (props: { element: Element; children?: Elements }) => ReactNode;

/**
 * Registry mapping composite keys to rendering components.
 * - Keys are `"site.type"` composites, e.g. `"page.tree-directory"`, `"card.tree-function"`.
 * - This allows different rendering for the same element type in different contexts (page vs card vs menu).
 */
export type ElementTypes = Readonly<Record<string, ElementComponent>>;

const _ElementTypesContext = createContext<ElementTypes>({});
_ElementTypesContext.displayName = "ElementTypesContext";

export interface ElementContextProps {
	/** Map of composite keys to components. Merged with (and overrides) any parent context. */
	types: ElementTypes;
	children: ReactNode;
}

/**
 * Provide or extend the element type registry.
 * - Merges with any parent `ElementContext`, with this context's types taking precedence.
 */
export function ElementContext({ types, children }: ElementContextProps): ReactNode {
	const parent = use(_ElementTypesContext);
	return <_ElementTypesContext value={{ ...parent, ...types }}>{children}</_ElementTypesContext>;
}

/**
 * Look up the component registered for a given site and element type.
 *
 * @param site The rendering context, e.g. `"page"`, `"card"`, `"menu"`.
 * @param type The element's type string, e.g. `"tree-directory"`, `"tree-function"`.
 * @returns The registered component, or `undefined` if none is registered.
 */
export function useElementComponent(site: string, type: string): ElementComponent | undefined {
	const types = use(_ElementTypesContext);
	return types[`${site}.${type}`];
}
