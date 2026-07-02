import { type ReactElement, useRef } from "react";
import { getBlockClass } from "../style/Block.js";
import type { SpaceVariants } from "../style/Space.js";
import type { WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import VIDEO_CSS from "./Video.module.css";

const VIDEO_CLASS = getModuleClass(VIDEO_CSS, "video");

/**
 * Props for `Video` — space and width variants plus optional `children`.
 *
 * @see https://shelving.cc/ui/VideoProps
 */
export interface VideoProps extends SpaceVariants, WidthVariants, OptionalChildProps {}

/**
 * Video container element.
 * - Has a black background and a 16:9 aspect ratio.
 * - Shows its contents (i.e. a `<video>` element or a `<TwilioRoom>`).
 *
 * @kind component
 * @example <Video><video src="/clip.mp4" /></Video>
 * @see https://shelving.cc/ui/Video
 */
export function Video({ children, ...props }: VideoProps): ReactElement {
	const ref = useRef<HTMLElement | null>(null);

	return (
		<figure
			ref={ref}
			className={getClass(
				VIDEO_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</figure>
	);
}
