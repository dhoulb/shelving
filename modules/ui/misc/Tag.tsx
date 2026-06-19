import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import TAG_CSS from "./Tag.module.css";

const TAG_CLASS = getModuleClass(TAG_CSS, "tag");

/**
 * Styling variants accepted by `<Tag>` — status, colour, and typography options.
 *
 * @see https://dhoulb.github.io/shelving/ui/misc/Tag/TagVariants
 */
export interface TagVariants extends StatusVariants, ColorVariants, TypographyVariants {}

/**
 * Build the combined `className` string for a `<Tag>` from its styling variants.
 *
 * @param variants The status, colour, and typography variants to apply.
 * @returns The merged tag `className` string.
 * @example getTagClass({ success: true }) // "tag … status-success"
 * @see https://dhoulb.github.io/shelving/ui/misc/Tag/getTagClass
 */
export function getTagClass(variants: TagVariants) {
	return getClass(
		TAG_CLASS, //
		getStatusClass(variants),
		getColorClass(variants),
		getTypographyClass(variants),
	);
}

/**
 * Props for `<Tag>` — `TagVariants` styling options plus `<Clickable>` props (`href`, `onClick`, `children`, etc.).
 *
 * @see https://dhoulb.github.io/shelving/ui/misc/Tag/TagProps
 */
export interface TagProps extends TagVariants, ClickableProps {}

/**
 * Small inline label used to annotate other content.
 * - Delegates to `getClickable()` — renders as `<a>` when `href` is set, otherwise `<button>`.
 * - Accepts a status variant (`success`, `info`, `error`, etc.) _or_ a raw colour (`color="red"`, `color="purple"`, etc.).
 *
 * @returns The tag element.
 * @kind component
 * @example <Tag success>Active</Tag>
 * @example <Tag color="purple" href="/beta">Beta</Tag>
 * @see https://dhoulb.github.io/shelving/ui/misc/Tag/Tag
 */
export function Tag(props: TagProps): ReactElement {
	return <Clickable {...props} className={getTagClass(props)} />;
}
