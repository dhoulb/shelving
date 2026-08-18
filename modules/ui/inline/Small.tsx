import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import SMALL_CSS from "./Small.module.css";

const SMALL_CLASS = getModuleClass(SMALL_CSS, "small");

/**
 * Props for `Small` — optional `children`.
 *
 * @see https://shelving.cc/ui/SmallProps
 */
export interface SmallProps extends OptionalChildProps, TypographyVariants, ClassProps {}

/**
 * Small print — renders a `<small>` element for side comments and fine print.
 *
 * @kind component
 * @example <Small>Terms apply.</Small>
 * @see https://shelving.cc/ui/Small
 */
export function Small({ children, className, ...props }: SmallProps): ReactElement {
	return (
		<small
			className={getClass(
				SMALL_CLASS, //
				getTypographyClass(props),
				className,
			)}
		>
			{children}
		</small>
	);
}
