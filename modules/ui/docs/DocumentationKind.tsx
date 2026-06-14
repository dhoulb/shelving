import type { ReactElement } from "react";
import { Tag, type TagProps } from "../misc/Tag.js";
import type { UIColor } from "../style/Color.js";

/**
 * Props for `DocumentationKind` — a `TagProps` plus the documented symbol's `kind`.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/DocumentationKindProps
 */
export interface DocumentationKindProps extends TagProps {
	/** The documentation kind (e.g. `"function"`, `"class"`, `"interface"`, `"type"`, `"constant"`, `"method"`, `"property"`). */
	readonly kind: string;
}

/** Mapping from a documented symbol's `kind` to its raw colour variant. */
const KIND_COLOR: { readonly [K in string]?: UIColor } = {
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
 *
 * @param kind The documented symbol's kind (e.g. `"function"`, `"class"`, `"method"`).
 * @returns The matching `UIColor`, or `undefined` when the kind is unrecognised.
 * @example getDocumentationKindColor("class") // "purple"
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/getDocumentationKindColor
 */
export function getDocumentationKindColor(kind: string): UIColor | undefined {
	return KIND_COLOR[kind];
}

/**
 * Colour-coded tag for a documented symbol's kind.
 * - Thin wrapper over `<Tag>` that maps the kind string to a raw colour variant.
 *
 * @param props The kind to label plus any `TagProps` to forward to the underlying `<Tag>`.
 * @returns A `<Tag>` showing the kind, tinted by its colour.
 * @example <DocumentationKind kind="function" />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/DocumentationKind
 */
export function DocumentationKind({ kind = "unknown", ...props }: DocumentationKindProps): ReactElement {
	return (
		<Tag color={getDocumentationKindColor(kind)} {...props}>
			{kind}
		</Tag>
	);
}
