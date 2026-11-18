import type { AnimationEvent, ReactElement, SyntheticEvent } from "react";
import { getBlockClass } from "../style/Block.js";
import type { SpaceVariants } from "../style/Space.js";
import type { WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import IMAGE_CSS from "./Image.module.css";

const IMAGE_CLASS = getModuleClass(IMAGE_CSS, "image");

/**
 * Props for `Image` — an `src`, optional `alt` text, plus space and width variants.
 *
 * @see https://shelving.cc/ui/ImageProps
 */
export interface ImageProps extends SpaceVariants, WidthVariants, ClassProps {
	src: string;
	alt?: string;
}

/**
 * Image block — renders an `<img>` with space and width variants applied.
 * - It loads `lazy`, and fades in once when it loads. An image that is already loaded when it mounts shows at once.
 * - It never holds a transition (such as a page change): React waits only for an eager `<img>` with no `onLoad`.
 * - The load state is the `data-loaded` attribute (none, `fade`, then `done`), set on the element directly, so a load never re-renders.
 *
 * @kind component
 * @example <Image src="/logo.png" alt="Logo" width="narrow" />
 * @see https://shelving.cc/ui/Image
 */
export function Image({ src, alt, className, ...props }: ImageProps): ReactElement {
	return (
		<img
			src={src}
			alt={alt}
			loading="lazy"
			ref={_refImage}
			onLoad={_onImageLoad}
			onError={_onImageDone}
			onAnimationEnd={_onImageDone}
			className={getClass(
				IMAGE_CLASS, //
				getBlockClass(props),
				className,
			)}
		/>
	);
}

/** Show an image that loaded before it mounted (from the cache, or before hydration) at once, with no fade. */
function _refImage(img: HTMLImageElement | null): void {
	if (img?.complete && !img.dataset.loaded) img.dataset.loaded = "done";
}

/** Fade the image in when it loads. */
function _onImageLoad({ currentTarget }: SyntheticEvent<HTMLImageElement>): void {
	if (!currentTarget.dataset.loaded) currentTarget.dataset.loaded = "fade";
}

/** End the fade, or show an image that failed to load. */
function _onImageDone({ currentTarget }: SyntheticEvent<HTMLImageElement> | AnimationEvent<HTMLImageElement>): void {
	currentTarget.dataset.loaded = "done";
}
