import { Fragment, type ReactNode } from "react";
import { TreeLink } from "../tree/TreeLink.js";

/**
 * Split a type expression on ` | ` into its individual union members.
 * - An `undefined` member is dropped from display and instead flags the value as optional — we often write `| undefined` explicitly (e.g. for `exactOptionalPropertyTypes`, or to allow an explicit `undefined` to trigger a default), which reads as noise in the docs.
 * - When nothing but `undefined` is left, the members are kept as-is rather than emptied.
 *
 * @param type The type expression to split (e.g. `"Schemas<T> | DataSchema<T>"`).
 * @returns The non-`undefined` members, plus whether an `undefined` member was dropped.
 * @see https://shelving.cc/ui/splitType
 */
export function splitType(type: string): { readonly members: readonly string[]; readonly optional: boolean } {
	const parts = type
		.split(" | ")
		.map(part => part.trim())
		.filter(Boolean);
	const members = parts.filter(part => part !== "undefined");
	return members.length ? { members, optional: members.length !== parts.length } : { members: parts, optional: false };
}

/**
 * Props for `DocumentationType` — the union members to render (see [`splitType`](/ui/splitType)).
 *
 * @see https://shelving.cc/ui/DocumentationTypeProps
 */
export interface DocumentationTypeProps {
	/** Union members to render — one linked token each, stacked on their own line. */
	readonly members: readonly string[];
}

/**
 * Render a documentation table's `Type` column — one linked token per union member, each stacked on its own line.
 * - Each member links to its documented page via [`TreeLink`](/ui/TreeLink) (exact-match only; compound or builtin types stay plain text).
 *
 * @kind component
 * @returns One [`TreeLink`](/ui/TreeLink) per member, separated by line breaks.
 * @example <DocumentationType members={["Schemas<T>", "DataSchema<T>"]} />
 * @see https://shelving.cc/ui/DocumentationType
 */
export function DocumentationType({ members }: DocumentationTypeProps): ReactNode {
	return members.map((member, index) => (
		<Fragment key={member}>
			{index > 0 && <br />}
			<TreeLink name={member} nowrap />
		</Fragment>
	));
}
