import { PARAGRAPH_CLASS, type ParagraphProps } from "../block/Paragraph.js";
import { LOADING } from "../misc/Loading.js";
import { type ColorProps, getColorClass } from "../style/Color.js";
import { getStatus, getStatusClass, type StatusProps } from "../style/Status.js";
import { TINT_CLASS } from "../style/Tint.js";
import { getClass } from "../util/css.js";
import MESSAGE_CSS from "./Message.module.css";

export const MESSAGE_CLASS = getClass(MESSAGE_CSS.message);

export interface MessageProps extends ParagraphProps, ColorProps, StatusProps {}

/** Paragraph with status colours. */
export function Message({ children, ...props }: MessageProps) {
	const status = getStatus(props);
	return (
		<p
			role={status === "error" || status === "danger" ? "alert" : "status"}
			className={getClass(
				PARAGRAPH_CLASS, //
				MESSAGE_CLASS,
				TINT_CLASS,
				getStatusClass(status),
				getColorClass(props),
			)}
		>
			{children}
		</p>
	);
}

export const LOADING_MESSAGE = <Message status="loading">{LOADING}</Message>;
