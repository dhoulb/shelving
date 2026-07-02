import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/16/solid";
import { type ReactElement, useEffect, useState } from "react";
import { Button, type ButtonVariants } from "./Button.js";

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
