import { LOADING } from "../misc/Loading.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/index.js";
import MESSAGE_CSS from "./Message.module.css";

const MESSAGE_CLASS = getModuleClass(MESSAGE_CSS, "message");

/**
 * Props for `<Message>` — paragraph props plus colour and status styling variants.
 *
 * @see https://shelving.cc/ui/MessageProps
 */
export interface MessageProps extends BlockVariants, StatusVariants, ChildProps {}

/**
 * Status-coloured paragraph used for inline feedback messages.
 *
 * - Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.
 *
 * @param children The message content.
 * @returns The message paragraph element.
 * @example <Message status="error">Something went wrong</Message>
 * @see https://shelving.cc/ui/Message
 */
export function Message({ children, ...props }: MessageProps) {
	const { status } = props;
	return (
		<p
			role={status === "error" || status === "danger" ? "alert" : "status"}
			className={getClass(
				MESSAGE_CLASS, //
				getBlockClass(props),
				getStatusClass(props),
			)}
		>
			{children}
		</p>
	);
}

/**
 * Shared loading `<Message>` element containing the `<Loading>` spinner.
 *
 * @example return isLoading ? LOADING_MESSAGE : <Message>{text}</Message>;
 * @see https://shelving.cc/ui/LOADING_MESSAGE
 */
export const LOADING_MESSAGE = <Message status="loading">{LOADING}</Message>;
