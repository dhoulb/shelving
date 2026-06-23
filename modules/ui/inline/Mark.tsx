import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import MARK_CSS from "./Mark.module.css";

const MARK_CLASS = getModuleClass(MARK_CSS, "mark");

/**
 * Props for `Mark` — optional `children`.
 *
 * @see https://shelving.cc/ui/MarkProps
 */
export interface MarkProps extends OptionalChildProps {}

/**
 * Highlighted text — renders a `<mark>` element to call attention to a run of text.
 *
 * @kind component
 * @returns Rendered `<mark>` element.
 * @example <Mark>search term</Mark>
 * @see https://shelving.cc/ui/Mark
 */
export function Mark({ children }: MarkProps): ReactElement {
	return <mark className={MARK_CLASS}>{children}</mark>;
}
