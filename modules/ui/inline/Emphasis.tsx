import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import EMPHASIS_CSS from "./Emphasis.module.css";

const EMPHASIS_CLASS = getModuleClass(EMPHASIS_CSS, "emphasis");

/**
 * Props for `Emphasis` — optional `children`.
 *
 * @see https://shelving.cc/ui/EmphasisProps
 */
export interface EmphasisProps extends OptionalChildProps, TypographyVariants {}

/**
 * Emphasised text — renders an `<em>` element for stress emphasis (typically italic).
 *
 * @kind component
 * @example <Emphasis>really</Emphasis>
 * @see https://shelving.cc/ui/Emphasis
 */
export function Emphasis({ children, ...props }: EmphasisProps): ReactElement {
	return (
		<em
			className={getClass(
				EMPHASIS_CLASS, //
				getTypographyClass(props),
			)}
		>
			{children}
		</em>
	);
}
