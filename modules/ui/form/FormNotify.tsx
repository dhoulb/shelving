import { useEffect } from "react";
import { useStore } from "../../react/useStore.js";
import { notifySuccess } from "../util/notice.js";
import { requireForm } from "./FormContext.js";

/**
 * Publish the current form's "main" (unnamed) message as a global success notice whenever it changes.
 * - Renders nothing; mount it inside a [`Form`](/ui/Form) to surface the message globally.
 *
 * @returns Nothing — this component only triggers a side effect.
 * @example <FormNotify />
 * @see https://dhoulb.github.io/shelving/ui/form/FormNotify/FormNotify
 */
export function FormNotify(): void {
	const message = useStore(requireForm().messages).get("");
	useEffect(() => {
		notifySuccess(message);
	}, [message]);
}
