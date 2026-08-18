import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import STRONG_CSS from "./Strong.module.css";

const STRONG_CLASS = getModuleClass(STRONG_CSS, "strong");

/**
 * Props for `Strong` — optional `children`.
 *
 * @see https://shelving.cc/ui/StrongProps
 */
export interface StrongProps extends OptionalChildProps, TypographyVariants, ClassProps {}

/**
 * Strong importance — renders a `<strong>` element for text of strong importance (typically bold).
 *
 * @kind component
 * @see https://shelving.cc/ui/Strong
 */
export function Strong({ children, className, ...props }: StrongProps): ReactElement {
	return (
		<strong
			className={getClass(
				STRONG_CLASS, //
				getTypographyClass(props),
				className,
			)}
		>
			{children}
		</strong>
	);
}
