import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Message, type MessageProps } from "../notice/Message.js";
import { requireForm } from "./FormContext.js";

/**
 * Show the current form's "main" (unnamed) message as a `<Message>`, or render nothing when there is no message.
 *
 * @param props Message props (excluding `children`) forwarded to the underlying `<Message>`.
 * @returns A `<Message status="error">` containing the message, or `null` when empty.
 * @kind component
 * @example <FormMessage />
 * @see https://dhoulb.github.io/shelving/ui/form/FormMessage/FormMessage
 */
export function FormMessage(props: Omit<MessageProps, "children">): ReactElement | null {
	const message = useStore(requireForm().messages).get("");
	if (!message) return null;
	return (
		<Message status="error" {...props}>
			{message}
		</Message>
	);
}
