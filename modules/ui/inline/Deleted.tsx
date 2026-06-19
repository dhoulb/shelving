import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import DELETED_CSS from "./Deleted.module.css";

const DELETED_CLASS = getModuleClass(DELETED_CSS, "definitions");

/**
 * Props for `Deleted` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Deleted/DeletedProps
 */
export interface DeletedProps extends OptionalChildProps {}

/**
 * Deleted text — renders a `<del>` element to mark content removed from a document.
 *
 * @returns Rendered `<del>` element.
 * @kind component
 * @example <Deleted>old price</Deleted>
 * @see https://dhoulb.github.io/shelving/ui/inline/Deleted/Deleted
 */
export function Deleted({ children }: DeletedProps): ReactElement {
	return <del className={DELETED_CLASS}>{children}</del>;
}
