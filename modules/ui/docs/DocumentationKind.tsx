import type { ReactElement } from "react";
import { Tag } from "../misc/Tag.js";
import type { Color } from "../style/Color.js";

/** Props for `DocumentationKind`. */
export interface DocumentationKindProps {
	/** The documentation kind (e.g. `"function"`, `"class"`, `"interface"`, `"type"`, `"constant"`, `"method"`, `"property"`). */
	readonly kind: string;
}

/** Mapping from a documented symbol's `kind` to its raw colour variant. */
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
 * Get the raw colour variant for a documented symbol's `kind`, or `undefined` for an unknown kind.
 * - Shared source of truth so the kind tag and its surrounding card pick the same hue.
 */
export function getDocumentationKindColor(kind: string): Color | undefined {
	return KIND_COLOR[kind];
}

/**
 * Colour-coded tag for a documented symbol's kind.
 * - Thin wrapper over `<Tag>` that maps the kind string to a raw colour variant.
 *
 * @example <DocumentationKind kind="function" />
 */
export function DocumentationKind({ kind }: DocumentationKindProps): ReactElement {
	const color = getDocumentationKindColor(kind);
	return <Tag {...(color ? { [color]: true } : {})}>{kind}</Tag>;
}
