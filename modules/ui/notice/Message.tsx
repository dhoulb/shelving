import type { ReactNode } from "react";
import { PARAGRAPH_CSS, type ParagraphProps } from "../block/Paragraph.js";
import { LOADING } from "../misc/Loading.js";
import { getClass, getModuleClass } from "../util/css.js";
import MESSAGE_CSS from "./Message.module.css";
import { getStatusClass, type Status } from "./Status.js";

export interface MessageProps extends ParagraphProps {
	children?: ReactNode;
	/** Status of the message (defaults to "error") */
	status?: Status | undefined;
}

/** Paragraph with status colours. */
export function Message({ children, status = "info", ...variants }: MessageProps) {
	return (
		<p
			role={status === "error" || status === "danger" ? "alert" : "status"}
			className={getClass(
				getModuleClass(PARAGRAPH_CSS, "paragraph", variants), //
				MESSAGE_CSS.message,
				getStatusClass(status),
			)}
		>
			{children}
		</p>
	);
}

export const LOADING_MESSAGE = <Message status="loading">{LOADING}</Message>;
