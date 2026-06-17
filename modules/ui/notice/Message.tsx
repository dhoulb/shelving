import { getParagraphClass, type ParagraphProps } from "../block/Paragraph.js";
import { LOADING } from "../misc/Loading.js";
import type { ColorVariants } from "../style/Color.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import MESSAGE_CSS from "./Message.module.css";

const MESSAGE_CLASS = getModuleClass(MESSAGE_CSS, "message");

/**
 * Props for `<Message>` — paragraph props plus colour and status styling variants.
 *
 * @see https://dhoulb.github.io/shelving/ui/notice/Message/MessageProps
 */
export interface MessageProps extends ParagraphProps, ColorVariants, StatusVariants {}

/**
 * Status-coloured paragraph used for inline feedback messages.
 *
 * - Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.
 *
 * @param children The message content.
 * @returns The message paragraph element.
 * @example <Message status="error">Something went wrong</Message>
 * @see https://dhoulb.github.io/shelving/ui/notice/Message/Message
 */
export function Message({ children, ...props }: MessageProps) {
	const { status } = props;
	return (
		<p
			role={status === "error" || status === "danger" ? "alert" : "status"}
			className={getClass(
				getParagraphClass(props), //
				MESSAGE_CLASS,
				getStatusClass(props),
			)}
		>
			{children}
		</p>
	);
}

/**
 * Shared loading `<Message>` element containing the [`<Loading>`](/ui/Loading) spinner.
 *
 * @example return isLoading ? LOADING_MESSAGE : <Message>{text}</Message>;
 * @see https://dhoulb.github.io/shelving/ui/notice/Message/LOADING_MESSAGE
 */
export const LOADING_MESSAGE = <Message status="loading">{LOADING}</Message>;
