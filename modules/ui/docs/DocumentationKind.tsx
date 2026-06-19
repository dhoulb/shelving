import type { ReactElement } from "react";
import { Tag, type TagProps } from "../misc/Tag.js";
import type { ColorVariant } from "../style/Color.js";

/**
 * Props for `DocumentationKind` — a `TagProps` plus the documented symbol's `kind`.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/DocumentationKindProps
 */
export interface DocumentationKindProps extends TagProps {
	/** The documentation kind (e.g. `"component"`, `"function"`, `"class"`, `"interface"`, `"type"`, `"constant"`, `"method"`, `"static method"`, `"property"`, `"static property"`). */
	readonly kind: string;
}

/**
 * Mapping from a documented symbol's `kind` to its raw colour variant.
 * - Related kinds share a hue: component/class (purple), function/method (blue), interface/type (aqua).
 * - Leaves `orange`, `pink`, and the brand aliases free for future kinds.
 */
const KIND_COLOR: { readonly [K in string]?: ColorVariant } = {
	module: "red",
	component: "purple",
	class: "purple",
	function: "blue",
	method: "blue",
	"static method": "blue",
	interface: "aqua",
	type: "aqua",
	constant: "green",
	property: "yellow",
	"static property": "yellow",
};

/**
 * Get the raw colour variant for a documented symbol's `kind`, or `undefined` for an unknown kind.
 * - Shared source of truth so the kind tag and its surrounding card pick the same hue.
 *
 * @param kind The documented symbol's kind (e.g. `"function"`, `"class"`, `"method"`).
 * @returns The matching `ColorVariant`, or `undefined` when the kind is unrecognised.
 * @example getDocumentationKindColor("class") // "purple"
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/getDocumentationKindColor
 */
export function getDocumentationKindColor(kind: string): ColorVariant | undefined {
	return KIND_COLOR[kind];
}

/**
 * Colour-coded tag for a documented symbol's kind.
 * - Thin wrapper over `<Tag>` that maps the kind string to a raw colour variant.
 *
 * @returns A `<Tag>` showing the kind, tinted by its colour.
 * @kind component
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
