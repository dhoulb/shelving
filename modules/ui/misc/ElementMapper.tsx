import { type ComponentType, createContext, type JSX, type ReactNode, use } from "react";
import type { ImmutableArray } from "../../util/array.js";
import type { Element } from "../../util/element.js";

/**
 * Type-safe element map entries.
 * - Keys are `"Prefix.element-type"` composites (e.g. `"TreePage.tree-directory"`).
 * - The component for each key must accept the props declared in `JSX.IntrinsicElements` for that element type.
 * - Optionally specify a `Prefix` to restrict keys to a single prefix string.
 */
export type ElementMapEntries<Prefix extends string = string> = {
	[K in keyof JSX.IntrinsicElements as `${Prefix}.${K}`]?: ComponentType<JSX.IntrinsicElements[K]>;
};

/** Loose internal type for context storage and lookup. */
type _Entries = Record<string, ComponentType<never>>;

const _ElementMapperContext = createContext<_Entries>({});
_ElementMapperContext.displayName = "ElementMapperContext";

export interface ElementMapperProps<P extends string = string> {
	map: ElementMapEntries<P>;
	children: ReactNode;
}

/**
 * Provide or extend the element map.
 * - Merges with any parent `ElementMapper`, with this map's entries taking precedence.
 */
export function ElementMapper<P extends string>({ map, children }: ElementMapperProps<P>): ReactNode {
	const existing = use(_ElementMapperContext);
	return <_ElementMapperContext value={{ ...existing, ...(map as _Entries) }}>{children}</_ElementMapperContext>;
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
	const entries = use(_ElementMapperContext);
	const result: Element[] = [];
	for (const element of elements) {
		const key = typeof element.type === "string" ? `${prefix}.${element.type}` : undefined;
		const component = key ? entries[key] : undefined;
		// biome-ignore lint/suspicious/noExplicitAny: ComponentType returns ReactNode which is wider than Elements; the cast is safe at render time.
		result.push(component ? { ...element, type: component as any } : element);
	}
	return result;
}
