import type { ReactElement } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { Tag, type TagProps } from "../misc/Tag.js";
import type { UIColor } from "../style/Color.js";
import { Row } from "../style/Flex.js";

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
const KIND_COLOR: { readonly [K in string]?: UIColor } = {
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

/**
 * Props for `DocumentationKindChips` — the kinds to offer plus the currently-selected kind.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/DocumentationKindChipsProps
 */
export interface DocumentationKindChipsProps {
	/** The kinds to show as chips, in display order. */
	readonly kinds: ImmutableArray<string>;
	/** The currently-selected kind, or `undefined` when none is selected. */
	readonly value?: string | undefined;
	/** Called with the clicked kind, or `undefined` when the active chip is clicked again to clear it. */
	readonly onValue?: ((kind: string | undefined) => void) | undefined;
}

/**
 * Row of clickable kind-filter chips — clicking a chip selects that kind, clicking the active chip clears it.
 * - Exclusive: at most one kind is selected at a time. The selected chip is shown bold.
 * - Renders `null` when there are no `kinds`.
 *
 * @kind component
 * @param props The `kinds` to offer, the selected `value`, and an `onValue` callback.
 * @returns A `<Row>` of colour-coded `<Tag>` chips, or `null` when there are no kinds.
 * @example <DocumentationKindChips kinds={["function", "class"]} value={kind} onValue={setKind} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationKind/DocumentationKindChips
 */
export function DocumentationKindChips({ kinds, value, onValue }: DocumentationKindChipsProps): ReactElement | null {
	if (!kinds.length) return null;
	return (
		<Row left wrap>
			{kinds.map(kind => (
				<Tag
					key={kind}
					color={getDocumentationKindColor(kind)}
					weight={kind === value ? "strong" : undefined}
					onClick={() => onValue?.(kind === value ? undefined : kind)}
				>
					{kind}
				</Tag>
			))}
		</Row>
	);
}
