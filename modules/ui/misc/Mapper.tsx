import { type ComponentType, createContext, type FunctionComponent, type JSX, type ReactNode, use } from "react";
import type { Elements } from "../../util/element.js";
import { walkElements } from "../../util/element.js";
import type { ChildProps } from "../util/props.js";

/**
 * Dispatch table from a `JSX.IntrinsicElements` key to a renderer component.
 * - Each entry is optional — unmapped elements fall through and render as themselves (e.g. an unmapped `<tree-foo>` appears as a raw `<tree-foo>` HTML element).
 * - Per-entry component receives `JSX.IntrinsicElements[K] & E` — the declared props for that element type, plus any extra props `E` the mapper is configured to thread through.
 *
 * @see https://shelving.cc/ui/Mapping
 */
export type Mapping<E = unknown> = {
	[K in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[K] & E>;
};

/**
 * Props for the `Mapping` component returned by `createMapper()`.
 *
 * @see https://shelving.cc/ui/MappingProps
 */
export interface MappingProps<E = unknown> extends ChildProps {
	/** Mapping entries that extend or override the inherited mapping inside this subtree. */
	readonly mapping: Mapping<E>;
}

/**
 * Props for the `Mapper` component returned by `createMapper()`.
 * - `children` holds the pre-walked elements to dispatch.
 * - All other props are spread onto every mapped child as additional props (`E`).
 *
 * @see https://shelving.cc/ui/MapperProps
 */
export type MapperProps<E = unknown> = E & {
	readonly children?: Elements;
};

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
 * @typeParam E The shape of any extra props the mapper threads through to every dispatched child. Defaults to `unknown` (no extras).
 * @param defaults The initial mapping of element types to renderer components.
 * @returns A `[Mapping, Mapper]` tuple of components sharing a private context.
 *
 * @example
 * // No extras:
 * const [TreeCardMapping, TreeCardMapper] = createMapper({
 *   "tree-element": TreeCard,
 * });
 * <TreeCardMapper>{walkElements(children)}</TreeCardMapper>
 *
 * @example
 * // With extras (`path` threaded into every dispatched child):
 * const [TreeMenuMapping, TreeMenuMapper] = createMapper<{ path?: AbsolutePath }>({
 *   "tree-element": TreeMenuItem,
 * });
 * <TreeMenuMapper path="/foo">{queryElements(children, query)}</TreeMenuMapper>
 *
 * @see https://shelving.cc/ui/createMapper
 */
export function createMapper<E = unknown>(
	defaults: Mapping<E> = {},
): [Mapping: FunctionComponent<MappingProps<E>>, Mapper: FunctionComponent<MapperProps<E>>] {
	const Context = createContext<AnyMapping>(defaults);

	function Mapping({ mapping, children }: MappingProps<E>): ReactNode {
		const inherited = use(Context);
		return <Context value={{ ...inherited, ...mapping }}>{children}</Context>;
	}

	function Mapper({ children, ...extras }: MapperProps<E>): ReactNode {
		const mapping = use(Context);
		const items: ReactNode[] = [];
		for (const element of walkElements(children)) {
			if (typeof element.type !== "string") {
				items.push(element);
				continue;
			}
			const Component = mapping[element.type];
			if (Component) {
				items.push(<Component key={element.key} {...extras} {...element.props} />);
			} else {
				items.push(element);
			}
		}
		return items;
	}

	return [Mapping, Mapper];
}
