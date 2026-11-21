import type { ReactElement } from "react";
import { getBlockClass } from "../style/Block.js";
import type { SpaceVariants } from "../style/Space.js";
import type { WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import { Image } from "./Image.js";
import PHOTO_CSS from "./Photo.module.css";

const PHOTO_CLASS = getModuleClass(PHOTO_CSS, "photo");
const PHOTO_IMAGE_CLASS = getModuleClass(PHOTO_CSS, "image");

/**
 * Props for `Photo` — an `src`, optional `alt` text, plus space and width variants.
 *
 * @see https://shelving.cc/ui/PhotoProps
 */
export interface PhotoProps extends SpaceVariants, WidthVariants, ClassProps {
	src: string;
	alt?: string | undefined;
}

/**
 * Photo block — an `<Image>` in a frame with rounded corners and a black background.
 * - The background shows while the image loads, then the image fades in over it.
 * - `className`, space and width go on the frame.
 *
 * @kind component
 * @see https://shelving.cc/ui/Photo
 */
export function Photo({ src, alt, className, ...props }: PhotoProps): ReactElement {
	return (
		<span
			className={getClass(
				PHOTO_CLASS, //
				getBlockClass(props),
				className,
			)}
		>
			<Image src={src} alt={alt} className={PHOTO_IMAGE_CLASS} />
		</span>
	);
}
