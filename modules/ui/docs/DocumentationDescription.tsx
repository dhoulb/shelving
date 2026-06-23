import type { ReactNode } from "react";
import { Prose } from "../block/Prose.js";
import { Tag } from "../misc/Tag.js";
import { TreeLink } from "../tree/TreeLink.js";
import { TreeMarkup } from "../tree/TreeMarkup.js";

/**
 * Props for `DocumentationDescription` — a description cell's resolved text, plus an optional default/optionality note.
 *
 * @see https://shelving.cc/ui/DocumentationDescriptionProps
 */
export interface DocumentationDescriptionProps {
	/** Already-resolved description text (hand-written, or fallen back to the referenced type's own description), rendered as inline markup. */
	readonly description?: string | undefined;
	/** Default-value expression — rendered as a trailing `Defaults to …` note (linked when it's a documented token). */
	readonly default?: string | undefined;
	/** Whether the value is optional — pass an explicit boolean to opt into the note: `false` appends `Required.` (when there's no default), `true` appends nothing. Leave `undefined` to suppress the note entirely (e.g. for returns/throws). */
	readonly optional?: boolean | undefined;
	/** Whether the value is read-only — appends a trailing `Readonly` note at the very end (after any `Defaults to …` / `Required.`). */
	readonly readonly?: boolean | undefined;
}

/**
 * Render a documentation table row's description cell.
 * - The description is parsed as inline markup via `TreeMarkup` (`context="inline"`), so backticks, emphasis and links resolve rather than showing as literal source — and each inline-code span auto-links to its documented token when one exists.
 * - When a `default` is given it renders a trailing `Defaults to …` note on the same line (linking the value when it's a documented token); otherwise, when `optional` is explicitly `false`, it renders a `required` `<Tag>`. (Optionality has no tag — it's implicit, and an optional value usually carries the longer `Defaults to …` text instead.)
 * - When `readonly` is set, a `readonly` `<Tag>` is appended at the very end (after any default/required note).
 * - Wrapped in `<Prose>` so markup-produced `<code>` (and other inline) elements pick up the standard prose typography (the chip background, etc.) — a bare `<code>` is only styled inside a `.prose` ancestor.
 *
 * @kind component
 * @returns The description and any trailing notes wrapped in a `<Prose>`, or `null` when all are empty.
 * @example <DocumentationDescription description="The `foo` value." optional={false} readonly />
 * @see https://shelving.cc/ui/DocumentationDescription
 */
export function DocumentationDescription({ description, default: def, optional, readonly }: DocumentationDescriptionProps): ReactNode {
	const body = description ? <TreeMarkup context="inline">{description}</TreeMarkup> : null;
	const requirement = def ? (
		<>
			Defaults to <TreeLink name={def} />
		</>
	) : optional === false ? (
		<Tag>required</Tag>
	) : null;
	if (!body && !requirement && !readonly) return null;
	return (
		<Prose>
			{body}
			{requirement ? (
				<>
					{body ? " " : null}
					{requirement}
				</>
			) : null}
			{readonly ? (
				<>
					{body || requirement ? " " : null}
					<Tag>readonly</Tag>
				</>
			) : null}
		</Prose>
	);
}
