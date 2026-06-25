import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import { type MouseEvent, type ReactElement, useEffect, useRef, useState } from "react";
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
 * - Shows its contents (i.e. a `<video>` element or a `<TwilioRoom>`.
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
 * Set of video buttons floating over a video.
 *
 * @example <VideoButtons><FullscreenVideoButton /></VideoButtons>
 * @see https://shelving.cc/ui/VideoButtons
 */
export function VideoButtons({ children, ...variants }: VideoButtonsProps) {
	return <div className={getModuleClass(VIDEO_CSS, "buttons", variants)}>{children}</div>;
}

/**
 * Individual video button over a video — renders a `<button>`.
 *
 * @kind component
 * @example <VideoButton title="Play" onClick={play}><PlayIcon /></VideoButton>
 * @see https://shelving.cc/ui/VideoButton
 */
export function VideoButton({ children, title, onClick, disabled, ...variants }: VideoButtonProps): ReactElement {
	return (
		<button type="button" onClick={onClick} className={getModuleClass(VIDEO_CSS, "button", variants)} title={title} disabled={disabled}>
			{children}
		</button>
	);
}

declare const _fullscreenVideoButtonProps: unique symbol;

/**
 * Props for `FullscreenVideoButton` — an empty marker interface (the component takes no props).
 *
 * @see https://shelving.cc/ui/FullscreenVideoButtonProps
 */
export interface FullscreenVideoButtonProps {
	readonly [_fullscreenVideoButtonProps]?: never;
}

/**
 * Button to toggle the surrounding video element in and out of fullscreen.
 * - Renders `null` when the browser does not support the Fullscreen API.
 * - Tracks fullscreen state so the icon and title flip between enter/exit.
 *
 * @returns Rendered fullscreen toggle button, or `null` when fullscreen is unavailable.
 * @kind component
 * @example <Video><video src="/clip.mp4" /><VideoButtons><FullscreenVideoButton /></VideoButtons></Video>
 * @see https://shelving.cc/ui/FullscreenVideoButton
 */
export function FullscreenVideoButton(): ReactElement | null {
	const [isFull, setFull] = useState(() => typeof document !== "undefined" && !!document.fullscreenElement);

	useEffect(() => {
		const onChange = () => setFull(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", onChange);
		return () => document.removeEventListener("fullscreenchange", onChange);
	});

	if (!document.fullscreenEnabled) return null;

	return (
		<VideoButton
			title={isFull ? "Exit full screen mode" : "Enter full screen mode"}
			onClick={({ currentTarget }) => {
				if (document.fullscreenElement) {
					document.exitFullscreen();
				} else {
					const parent = currentTarget.closest("figure, video");
					if (parent) parent.requestFullscreen();
				}
			}}
		>
			{isFull ? <ArrowsPointingInIcon /> : <ArrowsPointingOutIcon />}
		</VideoButton>
	);
}
