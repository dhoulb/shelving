import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import { type MouseEvent, type ReactElement, useEffect, useRef, useState } from "react";
import { Button, type ButtonVariants } from "../form/Button.js";
import { getBlockClass } from "../style/Block.js";
import type { SpaceVariants } from "../style/Space.js";
import type { WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps, OptionalChildProps } from "../util/props.js";
import VIDEO_CSS from "./Video.module.css";

const VIDEO_CLASS = getModuleClass(VIDEO_CSS, "video");

/**
 * Props for `Video` — space and width variants plus optional `children`.
 *
 * @see https://shelving.cc/ui/VideoProps
 */
export interface VideoProps extends SpaceVariants, WidthVariants, OptionalChildProps {}

/**
 * Props for `VideoButtons` — `children` plus an optional `left` alignment flag.
 *
 * @see https://shelving.cc/ui/VideoButtonsProps
 */
export interface VideoButtonsProps extends ChildProps {
	left?: boolean;
}

/**
 * Props for `VideoButton` — `children` plus optional `title`, `onClick`, `danger`, and `disabled`.
 *
 * @see https://shelving.cc/ui/VideoButtonProps
 */
export interface VideoButtonProps extends ChildProps {
	title?: string | undefined;
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
	danger?: boolean;
	disabled?: boolean;
}

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

/**
 * Component props for a `<FullscreenButton>`
 *
 * @see https://shelving.cc/ui/FullscreenButtonProps
 */
export interface FullscreenButtonProps extends ButtonVariants {
	/**
	 * CSS selector to identify the parent element to toggle fullscreen status on.
	 * @default "body, figure"
	 */
	target?: string;
}

/**
 * Button to toggle the surrounding `<figure>` element or `<body>` element in/out of fullscreen mode.
 * - Renders `null` when the browser does not support the Fullscreen API.
 * - Tracks fullscreen state so the icon and title toggle between enter/exit.
 * - Parent can be identified by `props.target`, but defaults to `figure, body` does not exist, the button will do nothing when clicked.
 * - The `<Figure>` and `<Video>` components are rendered as `<figure>` so this works out the box with both of these.
 * - If not contained in a `<figure>` by default the
 *
 * @returns Rendered fullscreen toggle button, or `null` when fullscreen is unavailable.
 * @kind component
 * @example <Video><video src="/clip.mp4" /><FullscreenButton /></Video>
 * @see https://shelving.cc/ui/FullscreenButton
 */
export function FullscreenButton({ target = "body, figure", ...props }): ReactElement | null {
	const [isFull, setFull] = useState(() => typeof document !== "undefined" && !!document.fullscreenElement);

	useEffect(() => {
		const onChange = () => setFull(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", onChange);
		return () => document.removeEventListener("fullscreenchange", onChange);
	});

	if (!document.fullscreenEnabled) return null;

	return (
		<Button
			title={isFull ? "Exit full screen mode" : "Enter full screen mode"}
			onClick={({ currentTarget }) => {
				if (document.fullscreenElement) {
					document.exitFullscreen();
				} else {
					const parent = currentTarget.closest(target);
					if (parent) parent.requestFullscreen();
				}
			}}
			{...props}
		>
			{isFull ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
		</Button>
	);
}
