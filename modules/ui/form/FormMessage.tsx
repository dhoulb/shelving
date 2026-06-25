import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Message } from "../notice/Message.js";
import type { BlockVariants } from "../style/Block.js";
import { requireForm } from "./FormContext.js";

/**
 * Show the current form's "main" (unnamed) message as a `<Message>`, or render nothing when there is no message.
 *
 * @returns A `<Message status="error">` containing the message, or `null` when empty.
 * @kind component
 * @example <FormMessage />
 * @see https://shelving.cc/ui/FormMessage
 */
export function FormMessage(props: BlockVariants): ReactElement | null {
	const message = useStore(requireForm().messages).get("");
	if (!message) return null;
	return (
		<Message status="error" {...props}>
			{message}
		</Message>
	);
}
