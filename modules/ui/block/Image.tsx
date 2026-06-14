import type { ReactElement } from "react";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Image.module.css";

export const IMAGE_CLASS = getModuleClass(styles, "image");
export const IMAGE_PROSE_CLASS = getModuleClass(styles, "prose");

export interface ImageProps extends SpaceVariants, WidthVariants {
	src: string;
	alt?: string;
}

export function Image({ src, alt, ...variants }: ImageProps): ReactElement {
	return <img src={src} alt={alt} className={getClass(IMAGE_CLASS, getSpaceClass(variants), getWidthClass(variants))} />;
}
