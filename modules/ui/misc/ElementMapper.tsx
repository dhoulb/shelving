import { type ComponentType, createContext, type JSX, type ReactElement, type ReactNode, use } from "react";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import { isElement } from "../../util/element.js";
import { isIterable } from "../../util/iterate.js";

/**
 * Type-safe element map entries.
 * - Keys are `"prefix.element-type"` composites (e.g. `"TreePage.tree-directory"`).
 * - The component for each key must accept the props declared in `JSX.IntrinsicElements` for that element type.
 */
export type ElementMapEntries = {
	[K in keyof JSX.IntrinsicElements as `${string}.${K}`]?: ComponentType<JSX.IntrinsicElements[K]>;
};

const _ElementMapperContext = createContext<ImmutableDictionary<ComponentType>>({});
_ElementMapperContext.displayName = "ElementMapperContext";

export interface ElementMapperProps {
	map: ElementMapEntries;
	children: ReactNode;
}

/**
 * Provide or extend the element map.
 * - Merges with any parent `ElementMapper`, with this map's entries taking precedence.
 */
export function ElementMapper({ map, children }: ElementMapperProps): ReactNode {
	const existing = use(_ElementMapperContext);
	return <_ElementMapperContext value={{ ...existing, ...(map as ImmutableDictionary<ComponentType>) }}>{children}</_ElementMapperContext>;
}

// Component props.

export interface MapElementsProps {
	/** Prefix for looking up components in the element map (e.g. `"TreeMenu"`). */
	prefix: string;
	/** Default element map entries — applied under any outer `ElementMapper` (outer entries take precedence). */
	map?: ElementMapEntries | undefined;
	/** Elements to map and render. */
	children?: ReactNode | Iterable<ReactNode>;
}

export interface MapElementProps {
	/** Prefix for looking up components in the element map (e.g. `"TreePage"`). */
	prefix: string;
	/** Default element map entries — applied under any outer `ElementMapper` (outer entries take precedence). */
	map?: ElementMapEntries | undefined;
	/** Single element to map and render. */
	children: ReactElement;
}

/**
 * Map a collection of elements, replacing `type` with registered components from the element map.
 * - For each element, looks up `"prefix.type"` in the map.
 * - If found, renders a new element with `type` replaced by the component function.
 * - If not found, renders the element unchanged.
 * - The optional `map` prop provides default entries that are overridden by any outer `ElementMapper`.
 */
export function MapElements({ prefix, map, children }: MapElementsProps): ReactNode {
	const entries = _useEntries(map);
	return _mapNode(children, prefix, entries);
}

/**
 * Map a single element, replacing `type` with a registered component from the element map.
 * - Looks up `"prefix.type"` in the map.
 * - If found, renders a new element with `type` replaced by the component function.
 * - If not found, renders the element unchanged.
 * - The optional `map` prop provides default entries that are overridden by any outer `ElementMapper`.
 */
export function MapElement({ prefix, map, children }: MapElementProps): ReactNode {
	const entries = _useEntries(map);
	return _mapElement(children, prefix, entries);
}

/** Merge default map entries under the existing context (outer entries take precedence). */
function _useEntries(map: ElementMapEntries | undefined): ImmutableDictionary<ComponentType> {
	const existing = use(_ElementMapperContext);
	if (!map) return existing;
	return { ...(map as ImmutableDictionary<ComponentType>), ...existing };
}

/** Recursively map a ReactNode, replacing element types with registered components. */
function _mapNode(node: ReactNode | Iterable<ReactNode>, prefix: string, entries: ImmutableDictionary<ComponentType>): ReactNode {
	if (!node) return node;
	if (isElement(node)) return _mapElement(node, prefix, entries);
	if (isIterable(node)) return Array.from(node, el => _mapNode(el, prefix, entries));
	return node;
}

/** Map a single element, replacing its type with a registered component if found. */
function _mapElement(element: ReactElement, prefix: string, entries: ImmutableDictionary<ComponentType>): ReactElement {
	const key = typeof element.type === "string" ? `${prefix}.${element.type}` : undefined;
	const found = key ? entries[key] : undefined;
	return found ? { ...element, type: found } : element;
}
