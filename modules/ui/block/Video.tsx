import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import { type MouseEvent, type ReactElement, useEffect, useRef, useState } from "react";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps, OptionalChildProps } from "../util/props.js";
import styles from "./Video.module.css";

/**
 * Props for `Video` — space and width variants plus optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Video/VideoProps
 */
export interface VideoProps extends SpaceVariants, WidthVariants, OptionalChildProps {}

/**
 * Props for `VideoButtons` — `children` plus an optional `left` alignment flag.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Video/VideoButtonsProps
 */
export interface VideoButtonsProps extends ChildProps {
	left?: boolean;
}

/**
 * Props for `VideoButton` — `children` plus optional `title`, `onClick`, `danger`, and `disabled`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Video/VideoButtonProps
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
 * @returns Rendered `<figure>` video container.
 * @example <Video><video src="/clip.mp4" /></Video>
 * @see https://dhoulb.github.io/shelving/ui/block/Video/Video
 */
export function Video({ children, ...variants }: VideoProps): ReactElement {
	const ref = useRef<HTMLElement | null>(null);

	return (
		<figure ref={ref} className={getClass(getModuleClass(styles, "video"), getSpaceClass(variants), getWidthClass(variants))}>
			{children}
		</figure>
	);
}

/**
 * Set of video buttons floating over a video.
 *
 * @returns Rendered overlay container for video buttons.
 * @example <VideoButtons><FullscreenVideoButton /></VideoButtons>
 * @see https://dhoulb.github.io/shelving/ui/block/Video/VideoButtons
 */
export function VideoButtons({ children, ...variants }: VideoButtonsProps) {
	return <div className={getModuleClass(styles, "buttons", variants)}>{children}</div>;
}

/**
 * Individual video button over a video — renders a `<button>`.
 *
 * @returns Rendered `<button>` element overlaid on the video.
 * @example <VideoButton title="Play" onClick={play}><PlayIcon /></VideoButton>
 * @see https://dhoulb.github.io/shelving/ui/block/Video/VideoButton
 */
export function VideoButton({ children, title, onClick, disabled, ...variants }: VideoButtonProps): ReactElement {
	return (
		<button type="button" onClick={onClick} className={getModuleClass(styles, "button", variants)} title={title} disabled={disabled}>
			{children}
		</button>
	);
}

declare const _fullscreenVideoButtonProps: unique symbol;

/**
 * Props for `FullscreenVideoButton` — an empty marker interface (the component takes no props).
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Video/FullscreenVideoButtonProps
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
 * @example <Video><video src="/clip.mp4" /><VideoButtons><FullscreenVideoButton /></VideoButtons></Video>
 * @see https://dhoulb.github.io/shelving/ui/block/Video/FullscreenVideoButton
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
