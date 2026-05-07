import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Notice, type NoticeProps } from "../notice/Notice.js";
import { requireForm } from "./FormContext.js";

/** Show the "main" message for the form as a `<Notice>` */

export function FormNotice(props: Omit<NoticeProps, "children">): ReactElement | null {
	const message = useStore(requireForm().messages).get("");
	if (!message) return null;
	return (
		<Notice status="error" {...props}>
			{message}
		</Notice>
	);
}
