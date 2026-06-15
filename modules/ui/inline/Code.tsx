import type { ReactElement } from "react";
import type { ColorVariants } from "../style/Color.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/index.js";
import CODE_CSS from "./Code.module.css";

const CODE_CLASS = getModuleClass(CODE_CSS, "code");

const CODE_PLAIN_CLASS = getModuleClass(CODE_CSS, "plain");

/**
 * Props for `Code` — colour and typography variants, optional `children`, plus a `plain` toggle.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Code/CodeProps
 */
export interface CodeProps extends ColorVariants, TypographyVariants, OptionalChildProps {
	plain?: boolean | undefined;
}

/**
 * Inline code span — renders a `<code>` element.
 * - Pass `plain` to drop the default background and padding.
 *
 * @kind component
 * @param props Colour and typography variants, `children`, plus an optional `plain` toggle.
 * @returns Rendered `<code>` element.
 * @example <Code>npm install</Code>
 * @see https://dhoulb.github.io/shelving/ui/inline/Code/Code
 */
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
