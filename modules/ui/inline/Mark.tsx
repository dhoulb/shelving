import type { ReactElement } from "react";
import { TINT_CLASS } from "../style/Tint.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import MARK_CSS from "./Mark.module.css";

const MARK_CLASS = getModuleClass(MARK_CSS, "mark");

/**
 * Props for `Mark` — optional `children`.
 *
 * @see https://shelving.cc/ui/MarkProps
 */
export interface MarkProps extends OptionalChildProps, TypographyVariants {}

/**
 * Highlighted text — renders a `<mark>` element to call attention to a run of text.
 *
 * @kind component
 * @see https://shelving.cc/ui/Mark
 */
export function Mark({ children, ...props }: MarkProps): ReactElement {
	return (
		<mark
			className={getClass(
				MARK_CLASS, //
				TINT_CLASS,
				getTypographyClass(props),
			)}
		>
			{children}
		</mark>
	);
}
