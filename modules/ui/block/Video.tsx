import { type MouseEvent, type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "shelving/icon";
import { getModuleClass } from "../util/css.js";
import styles from "./Video.module.css";

export interface VideoProps {
	children?: ReactNode;

	/** Constrain the video to narrow width (defaults to full-width). */
	narrow?: boolean;

	/** Constrain the video to wide width (defaults to full-width). */
	wide?: boolean;
}

export interface VideoButtonsProps {
	children: ReactNode;
	left?: boolean;
}

export interface VideoButtonProps {
	children: ReactNode;
	title?: string | undefined;
	onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
	danger?: boolean;
	disabled?: boolean;
}

/**
 * Video container element.
 * - Has a black background and a 16:9 aspect ratio.
 * - Shows its contents (i.e. a `<video>` element or a `<TwilioRoom>`.
 */
export function Video({ children, ...variants }: VideoProps): ReactElement {
	const ref = useRef<HTMLElement | null>(null);

	return (
		<figure ref={ref} className={getModuleClass(styles, "video", variants)}>
			{children}
		</figure>
	);
}

/** Set of video buttons floating over a video. */
export function VideoButtons({ children, ...variants }: VideoButtonsProps) {
	return <div className={getModuleClass(styles, "buttons", variants)}>{children}</div>;
}

/** Individual video button over a video. */
export function VideoButton({ children, title, onClick, disabled, ...variants }: VideoButtonProps): ReactElement {
	return (
		<button type="button" onClick={onClick} className={getModuleClass(styles, "button", variants)} title={title} disabled={disabled}>
			{children}
		</button>
	);
}

declare const _fullscreenVideoButtonProps: unique symbol;

export interface FullscreenVideoButtonProps {
	readonly [_fullscreenVideoButtonProps]?: never;
}

/** Button to make a video element go fullscreen. */
export function FullscreenVideoButton(): ReactElement | null {
	const [isFull, setFull] = useState(!!document.fullscreenElement);

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
