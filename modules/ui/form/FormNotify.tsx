import { useEffect } from "react";
import { useStore } from "../../react/useStore.js";
import { notifySuccess } from "../util/notice.js";
import { requireForm } from "./FormContext.js";

/** Publish the "main" message of a form as a global notice. */

export function FormNotify(): void {
	const message = useStore(requireForm().messages).get("");
	useEffect(() => {
		notifySuccess(message);
	}, [message]);
}
