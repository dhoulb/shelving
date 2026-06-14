import type { ReactElement } from "react";
import type { ColorVariants } from "../style/Color.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CODE_CSS from "./Code.module.css";

export const CODE_CLASS = getModuleClass(CODE_CSS, "code");
export const CODE_PLAIN_CLASS = getModuleClass(CODE_CSS, "plain");
export const CODE_PROSE_CLASS = getModuleClass(CODE_CSS, "prose");

export interface CodeProps extends ColorVariants, TypographyVariants, OptionalChildProps {
	plain?: boolean | undefined;
}

export function Code({ children, plain, ...props }: CodeProps): ReactElement {
	return (
		<code
			className={getClass(
				CODE_CLASS, //
				plain && CODE_PLAIN_CLASS,
				getTypographyClass(props),
			)}
		>
			{children}
		</code>
	);
}
