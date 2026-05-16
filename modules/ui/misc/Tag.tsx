import type { ReactElement, ReactNode } from "react";
import { type ClickableProps, getClickable } from "../form/Clickable.js";
import { getClass, getModuleClass } from "../util/css.js";
import { type ColorVariants, getColorClass } from "./Color.js";
import { getStatusClass, type StatusVariants } from "./Status.js";
import TAG_CSS from "./Tag.module.css";

/** Variants for tags — accepts both status and raw colour variants. */
export interface TagVariants extends StatusVariants, ColorVariants {
	/** Make the tag appear smaller. */
	small?: boolean | undefined;
}

export interface TagProps extends TagVariants, ClickableProps {
	children?: ReactNode;
}

/**
 * Small inline label used to annotate other content.
 * - Delegates to `getClickable()` — renders as `<a>` when `href` is set, otherwise `<button>`.
 * - Accepts a status variant (`success`, `info`, `error`, etc.) _or_ a raw colour variant (`red`, `blue`, `purple`, etc.).
 *
 * @example <Tag success>Active</Tag>
 * @example <Tag purple href="/beta">Beta</Tag>
 */
export function Tag({ disabled, href, onClick, title, target, download, children, ...variants }: TagProps): ReactElement {
	return getClickable(
		{ disabled, href, onClick, title, target, download, children },
		getClass(
			TAG_CSS.tag, //
			getModuleClass(TAG_CSS, variants),
			getStatusClass(variants),
			getColorClass(variants),
		),
	);
}

export { TAG_CSS };
