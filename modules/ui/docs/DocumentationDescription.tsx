import type { ReactNode } from "react";
import { Prose } from "../block/Prose.js";
import { Markup } from "../misc/Markup.js";
import { TreeLink } from "../tree/TreeLink.js";

/**
 * Props for `DocumentationDescription` — a description cell's resolved text, plus an optional default/optionality note.
 *
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationDescription/DocumentationDescriptionProps
 */
export interface DocumentationDescriptionProps {
	/** Already-resolved description text (hand-written, or fallen back to the referenced type's own description), rendered as inline markup. */
	readonly description?: string | undefined;
	/** Default-value expression — rendered as a trailing `Defaults to …` note (linked when it's a documented token). */
	readonly default?: string | undefined;
	/** Whether the value is optional — pass an explicit boolean to opt into the note: `false` appends `Required.` (when there's no default), `true` appends nothing. Leave `undefined` to suppress the note entirely (e.g. for returns/throws). */
	readonly optional?: boolean | undefined;
}

/**
 * Render a documentation table row's description cell.
 * - The description is parsed as inline markup (`context="inline"`), so backticks, emphasis and links resolve rather than showing as literal source.
 * - When a `default` is given it renders a trailing `Defaults to …` note on the same line (linking the value when it's a documented token); otherwise, when `optional` is explicitly `false`, it renders `Required.` for clarity.
 * - Wrapped in [`<Prose>`](/ui/Prose) so markup-produced `<code>` (and other inline) elements pick up the standard prose typography (the chip background, etc.) — a bare `<code>` is only styled inside a `.prose` ancestor.
 *
 * @kind component
 * @returns The description and any trailing note wrapped in a [`<Prose>`](/ui/Prose), or `null` when both are empty.
 * @example <DocumentationDescription description="The `foo` value." optional={false} />
 * @see https://dhoulb.github.io/shelving/ui/docs/DocumentationDescription/DocumentationDescription
 */
export function DocumentationDescription({ description, default: def, optional }: DocumentationDescriptionProps): ReactNode {
	const body = description ? <Markup context="inline">{description}</Markup> : null;
	const note = def ? (
		<>
			Defaults to <TreeLink name={def} />
		</>
	) : optional === false ? (
		<>Required.</>
	) : null;
	if (!body && !note) return null;
	return (
		<Prose>
			{body}
			{body && note ? " " : null}
			{note}
		</Prose>
	);
}
