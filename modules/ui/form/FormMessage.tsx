import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Message, type MessageProps } from "../notice/Message.js";
import { requireForm } from "./FormContext.js";

/** Show the "main" message for the form as a `<Message>` */

export function FormMessage(props: Omit<MessageProps, "children">): ReactElement | null {
	const message = useStore(requireForm().messages).get("");
	if (!message) return null;
	return (
		<Message status="error" {...props}>
			{message}
		</Message>
	);
}
