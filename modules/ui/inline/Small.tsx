import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SMALL_CSS from "./Small.module.css";

const SMALL_CLASS = getModuleClass(SMALL_CSS, "small");

/**
 * Props for `Small` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Small/SmallProps
 */
export interface SmallProps extends OptionalChildProps {}

/**
 * Small print — renders a `<small>` element for side comments and fine print.
 *
 * @param props The `children` to render as small print.
 * @returns Rendered `<small>` element.
 * @example <Small>Terms apply.</Small>
 * @see https://dhoulb.github.io/shelving/ui/inline/Small/Small
 */
export function Small({ children }: SmallProps): ReactElement {
	return <small className={SMALL_CLASS}>{children}</small>;
}
