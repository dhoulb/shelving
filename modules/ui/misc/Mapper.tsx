import { type ComponentType, createContext, type FunctionComponent, type JSX, type ReactNode, use } from "react";
import type { Elements } from "../../util/element.js";
import { walkElements } from "../../util/element.js";
import type { ChildProps } from "../util/props.js";

/**
 * Dispatch table from a `JSX.IntrinsicElements` key to a renderer component.
 * - Each entry is optional — unmapped elements fall through and render as themselves (e.g. an unmapped `<tree-foo>` appears as a raw `<tree-foo>` HTML element).
 * - Per-entry component receives `JSX.IntrinsicElements[K]` — the declared props for that element type.
 *
 * @see https://shelving.cc/ui/Mapping
 */
export type Mapping = {
	[K in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[K]>;
};

/**
 * Props for the `Mapping` component returned by `createMapper()`.
 *
 * @see https://shelving.cc/ui/MappingProps
 */
export interface MappingProps extends ChildProps {
	/** Mapping entries that extend or override the inherited mapping inside this subtree. */
	readonly mapping: Mapping;
}

/**
 * Props for the `Mapper` component returned by `createMapper()`.
 * - `children` holds the pre-walked elements to dispatch.
 *
 * @see https://shelving.cc/ui/MapperProps
 */
export interface MapperProps {
	readonly children?: Elements;
}

// Indexing the heterogeneous `Mapping` by an arbitrary string is unsafe by design — per-key value types diverge.
// biome-ignore lint/suspicious/noExplicitAny: Each mapping value is a `ComponentType<P>` with its own `P`; we accept `any` for dispatch.
type AnyMapping = Record<string, ComponentType<any> | undefined>;

/**
 * Create a `[Mapping, Mapper]` pair of components backed by their own private React context.
 *
 * - `Mapping` extends or overrides the mapping inside a subtree (useful for swapping in custom renderers for specific element types).
 * - `Mapper` accepts a pre-walked iterable of elements as `children` and dispatches each to the registered component for its `type`. Any other props passed to `Mapper` are spread onto every dispatched child.
 *
 * Each call creates its own context — independent mappers don't interfere with each other.
 *
 * @param defaults The initial mapping of element types to renderer components.
 * @returns A `[Mapping, Mapper]` tuple of components sharing a private context.
 * @see https://shelving.cc/ui/createMapper
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
		for (const element of walkElements(children)) {
			if (typeof element.type !== "string") {
				items.push(element);
				continue;
			}
			const Component = mapping[element.type];
			if (Component) {
				items.push(<Component key={element.key} {...element.props} />);
			} else {
				items.push(element);
			}
		}
		return items;
	}

	return [Mapping, Mapper];
}
