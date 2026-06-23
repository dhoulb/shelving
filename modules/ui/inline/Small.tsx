import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SMALL_CSS from "./Small.module.css";

const SMALL_CLASS = getModuleClass(SMALL_CSS, "small");

/**
 * Props for `Small` — optional `children`.
 *
 * @see https://shelving.cc/ui/SmallProps
 */
export interface SmallProps extends OptionalChildProps {}

/**
 * Small print — renders a `<small>` element for side comments and fine print.
 *
 * @returns Rendered `<small>` element.
 * @kind component
 * @example <Small>Terms apply.</Small>
 * @see https://shelving.cc/ui/Small
 */
export function Small({ children }: SmallProps): ReactElement {
	return <small className={SMALL_CLASS}>{children}</small>;
}
