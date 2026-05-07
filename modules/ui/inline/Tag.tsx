import type { ReactElement, ReactNode } from "react";
import { getStatusClass, type StatusVariants } from "../notice/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import TAG_CSS from "./Tag.module.css";

/** Variants for tags. */
export interface TagVariants extends StatusVariants {
	/** Use outline styling — transparent background with a coloured border. */
	outline?: boolean | undefined;
}

export interface TagProps extends TagVariants {
	children?: ReactNode;
}

/**
 * Small coloured pill / chip used to label or categorise something inline.
 * - Inherits status colour variants (`primary`, `success`, `warning`, etc.) from `StatusVariants`.
 * - Add `outline` for a transparent variant with a border.
 */
export function Tag({ children, ...variants }: TagProps): ReactElement {
	return (
		<span
			className={getClass(
				TAG_CSS.tag, //
				getModuleClass(TAG_CSS, variants),
				getStatusClass(variants),
			)}
		>
			{children}
		</span>
	);
}

export { TAG_CSS };
