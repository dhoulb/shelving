import type { ReactElement } from "react";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./Image.module.css";

const IMAGE_CLASS = getModuleClass(styles, "image");

/**
 * Props for `Image` — an `src`, optional `alt` text, plus space and width variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Image/ImageProps
 */
export interface ImageProps extends SpaceVariants, WidthVariants {
	src: string;
	alt?: string;
}

/**
 * Image block — renders an `<img>` with space and width variants applied.
 *
 * @returns Rendered `<img>` element.
 * @example <Image src="/logo.png" alt="Logo" width="narrow" />
 * @see https://dhoulb.github.io/shelving/ui/block/Image/Image
 */
export function Image({ src, alt, ...variants }: ImageProps): ReactElement {
	return <img src={src} alt={alt} className={getClass(IMAGE_CLASS, getSpaceClass(variants), getWidthClass(variants))} />;
}
