import type { ReactElement } from "react";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Image.module.css";

export const IMAGE_CLASS = getModuleClass(styles, "image");
export const IMAGE_PROSE_CLASS = getModuleClass(styles, "prose");

export interface ImageProps extends SpacingVariants, WidthVariants {
	src: string;
	alt?: string;
}

export function Image({ src, alt, ...variants }: ImageProps): ReactElement {
	return <img src={src} alt={alt} className={getClass(IMAGE_CLASS, getSpacingClass(variants), getWidthClass(variants))} />;
}
