import { type ComponentType, createContext, type JSX, type ReactElement, type ReactNode, use } from "react";
import { isElement } from "../../util/element.js";
import { isIterable } from "../../util/iterate.js";

/**
 * Element mapping — maps intrinsic element type strings to React components.
 * - Keys are element type names from `JSX.IntrinsicElements` (e.g. `"tree-file"`, `"tree-directory"`).
 * - Each component must accept the props declared in `JSX.IntrinsicElements` for that element type.
 */
export type ElementMapping = {
	[K in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[K]>;
};

// biome-ignore lint/suspicious/noExplicitAny: Loose internal type for context storage; type safety is enforced by ElementMapping at the public API boundary.
type _Entries = Record<string, ComponentType<any>>;

/** Props for the `Mapping` component returned by `createElementMapper()`. */
export interface ElementMappingProps {
	/** Mapping entries that override the defaults (and any parent `Mapping` entries). */
	mapping: ElementMapping;
	children: ReactNode;
}

/** Props for the `Mapper` component returned by `createElementMapper()`. */
export interface ElementMapperProps {
	children?: ReactNode;
}

/**
 * Create an element mapper — a `[Mapping, Mapper]` pair of React components.
 *
 * - `Mapping` — wraps a subtree to override or extend the element mapping for this mapper.
 * - `Mapper` — maps children, replacing element types with registered components.
 *
 * Each mapper has its own React context, so different mappers (e.g. `TreeMenu`, `TreePage`)
 * can have independent mappings without interfering with each other.
 *
 * @param defaults Default mapping entries (lowest priority — overridden by any `Mapping` wrapper).
 * @returns A `[Mapping, Mapper]` tuple of React components.
 */
export function createElementMapper(
	defaults?: ElementMapping,
): [React.FunctionComponent<ElementMappingProps>, React.FunctionComponent<ElementMapperProps>] {
	const Context = createContext<_Entries>((defaults ?? {}) as _Entries);

	/** Override or extend the element mapping for this mapper's context. */
	function Mapping({ mapping, children }: ElementMappingProps): ReactNode {
		const existing = use(Context);
		return <Context value={{ ...existing, ...(mapping as _Entries) }}>{children}</Context>;
	}

	/** Map children, replacing element types with components from this mapper's context. */
	function Mapper({ children }: ElementMapperProps): ReactNode {
		const entries = use(Context);
		return _mapNode(children, entries);
	}

	return [Mapping, Mapper];
}

/** Recursively map a ReactNode, replacing element types with registered components. */
function _mapNode(node: ReactNode, entries: _Entries): ReactNode {
	if (!node) return node;
	if (isElement(node)) return _mapElement(node, entries);
	if (isIterable(node)) return Array.from(node, el => _mapNode(el, entries));
	return node;
}

/** Map a single element, replacing its type with a registered component if found. */
function _mapElement(element: ReactElement, entries: _Entries): ReactElement {
	const found = typeof element.type === "string" ? entries[element.type] : undefined;
	return found ? { ...element, type: found } : element;
}
