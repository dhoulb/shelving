import type { ReactElement } from "react";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Image.module.css";

export interface ImageProps extends SpacingVariants, WidthVariants {
	src: string;
	alt?: string;
}

export function Image({ src, alt, ...variants }: ImageProps): ReactElement {
	return (
		<img src={src} alt={alt} className={getClass(getModuleClass(styles, "image"), getSpacingClass(variants), getWidthClass(variants))} />
	);
}
