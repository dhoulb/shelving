import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../button/Clickable.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import TAG_CSS from "./Tag.module.css";

const TAG_CLASS = getModuleClass(TAG_CSS, "tag");

/**
 * Styling variants accepted by `<Tag>` — status, colour, and typography options.
 *
 * @see https://shelving.cc/ui/TagVariants
 */
export interface TagVariants extends StatusVariants, TypographyVariants {}

/**
 * Build the combined `className` string for a `<Tag>` from its styling variants.
 *
 * @param variants The status, colour, and typography variants to apply.
 * @returns The merged tag `className` string.
 * @example getTagClass({ success: true }) // "tag … status-success"
 * @see https://shelving.cc/ui/getTagClass
 */
export function getTagClass(variants: TagVariants) {
	return getClass(
		TAG_CLASS, //
		getStatusClass(variants),
		getTypographyClass(variants),
	);
}

/**
 * Props for `<Tag>` — `TagVariants` styling options plus `<Clickable>` props (`href`, `onClick`, `children`, etc.).
 *
 * @see https://shelving.cc/ui/TagProps
 */
export interface TagProps extends TagVariants, ClickableProps {}

/**
 * Small inline label used to annotate other content.
 * - Delegates to `getClickable()` — renders as `<a>` when `href` is set, otherwise `<button>`.
 * - Accepts a status variant (`success`, `info`, `error`, etc.) _or_ a raw colour (`color="red"`, `color="purple"`, etc.).
 *
 * @kind component
 * @see https://shelving.cc/ui/Tag
 */
export function Tag(props: TagProps): ReactElement {
	return <Clickable {...props} className={getTagClass(props)} />;
}
