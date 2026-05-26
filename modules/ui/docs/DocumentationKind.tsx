import type { ReactElement } from "react";
import { Tag } from "../misc/Tag.js";
import type { Color } from "../style/Color.js";

/** Props for `DocumentationKind`. */
export interface DocumentationKindProps {
	/** The documentation kind (e.g. `"function"`, `"class"`, `"interface"`, `"type"`, `"constant"`, `"method"`, `"property"`). */
	readonly kind: string;
}

/** Mapping from a documented symbol's `kind` to its tag colour. */
const KIND_COLOR: { readonly [K in string]?: Color } = {
	module: "red",
	function: "blue",
	class: "purple",
	interface: "aqua",
	type: "pink",
	constant: "green",
	method: "orange",
	property: "yellow",
};

/**
 * Colour-coded tag for a documented symbol's kind.
 * - Thin wrapper over `<Tag>` that maps the kind string to a raw colour variant.
 *
 * @example <DocumentationKind kind="function" />
 */
export function DocumentationKind({ kind }: DocumentationKindProps): ReactElement {
	const color = KIND_COLOR[kind];
	return <Tag {...(color ? { [color]: true } : {})}>{kind}</Tag>;
}
