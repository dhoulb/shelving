import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import INSERTED_CSS from "./Inserted.module.css";

const INSERTED_CLASS = getModuleClass(INSERTED_CSS, "inserted");

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
