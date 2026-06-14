import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import INSERTED_CSS from "./Inserted.module.css";

/**
 * CSS class applied to the root element of every `Inserted`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Inserted/INSERTED_CLASS
 */
export const INSERTED_CLASS = getModuleClass(INSERTED_CSS, "inserted");

/**
 * CSS class that styles `Inserted` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Inserted/INSERTED_PROSE_CLASS
 */
export const INSERTED_PROSE_CLASS = getModuleClass(INSERTED_CSS, "prose");

/**
 * Props for `Inserted` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Inserted/InsertedProps
 */
export interface InsertedProps extends OptionalChildProps {}

/**
 * Inserted text — renders an `<ins>` element to mark content added to a document.
 *
 * @param props The `children` to render as inserted text.
 * @returns Rendered `<ins>` element.
 * @example <Inserted>new price</Inserted>
 * @see https://dhoulb.github.io/shelving/ui/inline/Inserted/Inserted
 */
export function Inserted({ children }: InsertedProps): ReactElement {
	return <ins className={INSERTED_CLASS}>{children}</ins>;
}
