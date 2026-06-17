import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import STRONG_CSS from "./Strong.module.css";

const STRONG_CLASS = getModuleClass(STRONG_CSS, "strong");

/**
 * Props for `Strong` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Strong/StrongProps
 */
export interface StrongProps extends OptionalChildProps {}

/**
 * Strong importance — renders a `<strong>` element for text of strong importance (typically bold).
 *
 * @kind component
 * @returns Rendered `<strong>` element.
 * @example <Strong>Warning</Strong>
 * @see https://dhoulb.github.io/shelving/ui/inline/Strong/Strong
 */
export function Strong({ children }: StrongProps): ReactElement {
	return <strong className={STRONG_CLASS}>{children}</strong>;
}
