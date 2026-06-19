import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Notice, type NoticeProps } from "../notice/Notice.js";
import { requireForm } from "./FormContext.js";

/**
 * Show the current form's "main" (unnamed) message as a `<Notice>`, or render nothing when there is no message.
 *
 * @param props Notice props (excluding `children`) forwarded to the underlying `<Notice>`.
 * @returns A `<Notice status="error">` containing the message, or `null` when empty.
 * @kind component
 * @example <FormNotice />
 * @see https://dhoulb.github.io/shelving/ui/form/FormNotice/FormNotice
 */
export function FormNotice(props: Omit<NoticeProps, "children">): ReactElement | null {
	const message = useStore(requireForm().messages).get("");
	if (!message) return null;
	return (
		<Notice status="error" {...props}>
			{message}
		</Notice>
	);
}
