import { type ReactElement, useEffect, useRef, useState } from "react";
import { isData } from "../../util/data.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import DOCUMENTATION_FRAME_CSS from "./DocumentationFrame.module.css";
import { formatPlaygroundHash, PLAYGROUND_FRAME_PATH, PLAYGROUND_HEIGHT_MESSAGE, type PlaygroundCode } from "./playground.js";

const FRAME_CLASS = getModuleClass(DOCUMENTATION_FRAME_CSS, "frame");

/**
 * Props for `<DocumentationFrame>` — the code and CSS to run, plus a title for the frame.
 *
 * @see https://shelving.cc/ui/DocumentationFrameProps
 */
export interface DocumentationFrameProps extends PlaygroundCode, ClassProps {
	/**
	 * Accessible title of the frame.
	 * @default "Preview"
	 */
	title?: string | undefined;
}

/**
 * Show a live preview of playground code in an `<iframe>` of the playground frame page.
 * - The frame page loads only the shelving styles, so the preview looks the same as in a real app, and the docs site styles do not leak in.
 * - The code and CSS go in the frame URL hash, so a change runs again without a reload.
 * - The frame grows to fit its content: the frame page posts its height to this component.
 * - The frame loads lazily, when it scrolls near the screen.
 *
 * @kind component
 * @see https://shelving.cc/ui/DocumentationFrame
 */
export function DocumentationFrame({ code, css, title = "Preview", className }: DocumentationFrameProps): ReactElement {
	const ref = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState<number | undefined>(undefined);

	// Listen for the height that the frame page posts.
	useEffect(() => {
		const onMessage = (e: MessageEvent): void => {
			const { data } = e;
			if (e.source !== ref.current?.contentWindow || !isData(data) || data.type !== PLAYGROUND_HEIGHT_MESSAGE) return;
			if (typeof data.height === "number") setHeight(data.height);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	return (
		<iframe
			ref={ref}
			className={getClass(FRAME_CLASS, className)}
			src={`${PLAYGROUND_FRAME_PATH}${formatPlaygroundHash({ code, css })}`}
			title={title}
			height={height}
			loading="lazy"
		/>
	);
}
