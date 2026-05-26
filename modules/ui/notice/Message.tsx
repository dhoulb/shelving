import { PARAGRAPH_CSS, type ParagraphProps } from "../block/Paragraph.js";
import { LOADING } from "../misc/Loading.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getStatus, getStatusClass, type Status, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import MESSAGE_CSS from "./Message.module.css";

export interface MessageProps extends ParagraphProps, ColorVariants, StatusVariants {
	/** Status of the message. Accepts a string (`status="success"`) or a boolean variant (`success`). Defaults to `"info"`. */
	status?: Status | undefined;
}

/** Paragraph with status colours. */
export function Message({ children, status, ...variants }: MessageProps) {
	const resolved: Status = status ?? getStatus(variants) ?? "info";
	return (
		<p
			role={resolved === "error" || resolved === "danger" ? "alert" : "status"}
			className={getClass(
				getModuleClass(PARAGRAPH_CSS, "paragraph", variants), //
				MESSAGE_CSS.message,
				getStatusClass(resolved),
				getColorClass(variants),
			)}
		>
			{children}
		</p>
	);
}

export const LOADING_MESSAGE = <Message status="loading">{LOADING}</Message>;
