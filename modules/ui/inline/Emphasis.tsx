import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import EMPHASIS_CSS from "./Emphasis.module.css";

const EMPHASIS_CLASS = getModuleClass(EMPHASIS_CSS, "emphasis");

/**
 * Props for `Emphasis` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Emphasis/EmphasisProps
 */
export interface EmphasisProps extends OptionalChildProps {}

/**
 * Emphasised text — renders an `<em>` element for stress emphasis (typically italic).
 *
 * @returns Rendered `<em>` element.
 * @example <Emphasis>really</Emphasis>
 * @see https://dhoulb.github.io/shelving/ui/inline/Emphasis/Emphasis
 */
export function Emphasis({ children }: EmphasisProps): ReactElement {
	return <em className={EMPHASIS_CLASS}>{children}</em>;
}
