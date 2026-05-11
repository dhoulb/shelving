import { type ComponentType, createContext, type FunctionComponent, type JSX, type ReactElement, type ReactNode, use } from "react";
import { isElement } from "../../util/element.js";
import { type ImmutableDictionary, isData, isProp, isString } from "../../util/index.js";
import { isIterable } from "../../util/iterate.js";

/**
 * Element mapping — maps intrinsic element type strings to React components.
 * - Keys are element type names from `JSX.IntrinsicElements` (e.g. `"tree-file"`, `"tree-directory"`).
 * - Each component must accept the props declared in `JSX.IntrinsicElements` for that element type.
 */
export type IntrinsicMapping = {
	[K in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[K]>;
};

/** A generic mapping object of any `string` to `ComponentType` */
export type Mapping = ImmutableDictionary<ComponentType>;

/** Props for the `Mapping` component returned by `createElementMapper()`. */
export interface MappingProps {
	/** Mapping entries that override the defaults (and any parent `Mapping` entries). */
	mapping: IntrinsicMapping;
	children: ReactNode;
}

/** Props for the `Mapper` component returned by `createElementMapper()`. */
export interface MapperProps {
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
 * @param mapping Default mapping entries (lowest priority — overridden by any `Mapping` wrapper).
 * @returns A `[Mapping, Mapper]` tuple of React components.
 */
export function createMapper(
	mapping: IntrinsicMapping = {},
): [Mapping: FunctionComponent<MappingProps>, Mapper: FunctionComponent<MapperProps>] {
	const Context = createContext(mapping as Mapping);

	/** Override or extend the element mapping for this mapper's context. */
	function Mapping({ mapping, children }: MappingProps): ReactNode {
		const existing = use(Context);
		return <Context value={{ ...existing, ...(mapping as Mapping) }}>{children}</Context>;
	}

	/** Map children, replacing element types with components from this mapper's context. */
	function Mapper({ children }: MapperProps): ReactNode {
		const entries = use(Context);
		return _mapNode(children, entries);
	}

	return [Mapping, Mapper];
}

/** Recursively map a ReactNode, replacing element types with registered components. */
function _mapNode(node: ReactNode, entries: Mapping): ReactNode {
	if (!node) return node;
	if (isElement(node)) return _mapElement(node, entries);
	if (isIterable(node)) return Array.from(node, el => _mapNode(el, entries));
	return node;
}

/** Map a single element, replacing its type with a registered component if found. */
function _mapElement(element: ReactElement, entries: Mapping): ReactElement {
	const { type, key, props } = element;
	if (isString(type)) {
		const Component = isProp(entries, type) ? entries[type] : undefined;
		if (Component) return <Component key={key} {...(isData(props) ? props : undefined)} />;
	}
	return element;
}
