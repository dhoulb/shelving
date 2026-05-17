import { type ComponentType, createContext, type FunctionComponent, type JSX, type ReactElement, type ReactNode, use } from "react";
import type { Elements } from "../../util/element.js";
import { getElements } from "../../util/element.js";

/**
 * Props received by a component dispatched through a `Mapper`.
 * - Spreads the element's own `props` (so a renderer for `tree-file` gets `FileElementProps`).
 * - Adds `mapped` — the dispatched `ReactElement` itself. Useful for components that need to reflect on the element beyond its props (e.g. walking `parent` to compute an href).
 *
 * @example function FileCard({ mapped, title, name }: MappedProps<FileElementProps>) { ... }
 */
export type MappedProps<P> = P & { readonly mapped: ReactElement<P> };

/**
 * Dispatch table from a `JSX.IntrinsicElements` key to a renderer component.
 * - Each entry is optional — unmapped elements fall through and render as themselves (e.g. an unmapped `<tree-foo>` appears as a raw `<tree-foo>` HTML element).
 * - Per-entry component receives `MappedProps<JSX.IntrinsicElements[K]>` — the declared props for that element type plus the `mapped` element reference.
 */
export type Mapping = {
	[K in keyof JSX.IntrinsicElements]?: ComponentType<MappedProps<JSX.IntrinsicElements[K]>>;
};

/** Props for the `Mapping` component returned by `createMapper()`. */
export interface MappingProps {
	/** Mapping entries that extend or override the inherited mapping inside this subtree. */
	readonly mapping: Mapping;
	readonly children: ReactNode;
}

/** Props for the `Mapper` component returned by `createMapper()`. */
export interface MapperProps {
	/** Pre-walked elements to dispatch — typically the output of `getElements()` / `queryElements()`. */
	readonly children?: Elements;
}

// Indexing the heterogeneous `Mapping` by an arbitrary string is unsafe by design — per-key value types diverge.
// biome-ignore lint/suspicious/noExplicitAny: Each mapping value is a `ComponentType<P>` with its own `P`; we accept `any` for dispatch.
type AnyMapping = Record<string, ComponentType<any> | undefined>;

/**
 * Create a `[Mapping, Mapper]` pair of components backed by their own private React context.
 *
 * - `Mapping` extends or overrides the mapping inside a subtree (useful for swapping in custom renderers for specific element types).
 * - `Mapper` accepts a pre-walked iterable of elements as `children` and dispatches each to the registered component for its `type`. Elements whose `type` has no mapping entry render as themselves (e.g. an unmapped `<tree-foo>` becomes a raw `<tree-foo>` HTML element).
 *
 * Each call creates its own context — independent mappers don't interfere with each other.
 *
 * @param defaults Default mapping entries (lowest priority — overridden by any wrapping `Mapping`).
 * @returns A `[Mapping, Mapper]` tuple of React components.
 *
 * @example
 * const [TreeCardMapping, TreeCardMapper] = createMapper({
 *   "tree-directory": DirectoryCard,
 *   "tree-file": FileCard,
 * });
 * // Default usage:
 * <TreeCardMapper>{getElements(parent.props.children, 0, parent)}</TreeCardMapper>
 * // Custom override at the app level:
 * <TreeCardMapping mapping={{ "tree-file": CustomFileCard }}>
 *   …
 * </TreeCardMapping>
 */
export function createMapper(defaults: Mapping = {}): [Mapping: FunctionComponent<MappingProps>, Mapper: FunctionComponent<MapperProps>] {
	const Context = createContext<AnyMapping>(defaults);

	function Mapping({ mapping, children }: MappingProps): ReactNode {
		const inherited = use(Context);
		return <Context value={{ ...inherited, ...mapping }}>{children}</Context>;
	}

	function Mapper({ children }: MapperProps): ReactNode {
		const mapping = use(Context);
		const items: ReactNode[] = [];
		for (const element of getElements(children, 0)) {
			if (typeof element.type !== "string") {
				// Functional elements (already-React-rendered output) pass through verbatim.
				items.push(element);
				continue;
			}
			const Component = mapping[element.type];
			if (Component) {
				// Mapped component — create a new component with the same key, props, and a `mapped={originalElement}`
				items.push(<Component key={element.key} mapped={element} {...element.props} />);
			} else {
				// No mapping for this type — render the element as itself (e.g. `<tree-foo>`).
				items.push(element);
			}
		}
		return items;
	}

	return [Mapping, Mapper];
}
