import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps, ClassProps } from "../util/index.js";
import MESSAGE_CSS from "./Message.module.css";

const MESSAGE_CLASS = getModuleClass(MESSAGE_CSS, "message");

/**
 * Props for `<Message>` — paragraph props plus colour and status styling variants.
 *
 * @see https://shelving.cc/ui/MessageProps
 */
export interface MessageProps extends BlockVariants, StatusVariants, ChildProps, ClassProps {}

/**
 * Status-coloured paragraph used for inline feedback messages.
 *
 * - Sets an ARIA `role` of `"alert"` for error/danger statuses, otherwise `"status"`.
 *
 * @example <Message status="error">Something went wrong</Message>
 * @see https://shelving.cc/ui/Message
 */
export function Message({ children, className, ...props }: MessageProps) {
	const { status } = props;
	return (
		<p
			role={status === "error" || status === "danger" ? "alert" : "status"}
			className={getClass(
				MESSAGE_CLASS, //
				getBlockClass(props),
				getStatusClass(props),
				className,
			)}
		>
			{children}
		</p>
	);
}
