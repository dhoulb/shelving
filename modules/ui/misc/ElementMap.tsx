import { createContext, type ReactNode, use } from "react";
import type { ImmutableArray } from "../../util/array.js";
import type { Element, ElementProps } from "../../util/element.js";

/**
 * A component registered in the element map.
 * - Receives the element's props directly (title, description, children, signature, etc.).
 */
export type ElementMapComponent = (props: ElementProps) => ReactNode;

/** Map of composite `"Prefix.type"` keys to components, e.g. `{ "TreePage.tree-directory": DirectoryPage }`. */
export type ElementMapEntries = Readonly<Record<string, ElementMapComponent>>;

const _ElementMapContext = createContext<ElementMapEntries>({});
_ElementMapContext.displayName = "ElementMapContext";

export interface ElementMapperProps {
	/** Map entries to provide. Merged with (and overrides) any parent context. */
	map: ElementMapEntries;
	children: ReactNode;
}

/**
 * Provide or extend the element map.
 * - Merges with any parent `ElementMapper`, with this map's entries taking precedence.
 */
export function ElementMapper({ map, children }: ElementMapperProps): ReactNode {
	const parent = use(_ElementMapContext);
	return <_ElementMapContext value={{ ...parent, ...map }}>{children}</_ElementMapContext>;
}

/**
 * Map elements through the element map context, replacing `type` with registered components.
 * - For each element, looks up `"prefix.type"` in the map.
 * - If found, returns a new element with `type` replaced by the component function.
 * - If not found, returns the element unchanged.
 *
 * Must be called during React render (uses context internally).
 */
export function mapElements(elements: Iterable<Element>, prefix: string): ImmutableArray<Element> {
	const entries = use(_ElementMapContext);
	const result: Element[] = [];
	for (const element of elements) {
		const key = typeof element.type === "string" ? `${prefix}.${element.type}` : undefined;
		const component = key ? entries[key] : undefined;
		// biome-ignore lint/suspicious/noExplicitAny: ElementMapComponent returns ReactNode which is wider than Elements; the cast is safe at render time.
		result.push(component ? { ...element, type: component as any } : element);
	}
	return result;
}
