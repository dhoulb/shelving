import type { ReactElement, ReactNode, SubmitEvent } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import type { DataSchema } from "../../schema/DataSchema.js";
import { isAsync } from "../../util/async.js";
import type { Data, PartialData } from "../../util/data.js";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import type { Arguments } from "../../util/function.js";
import { type NoticeCallback, notifySuccess, notifyThrown } from "../util/notice.js";
import styles from "./Form.module.css";
import { FormContext } from "./FormContext.js";
import { FormFields } from "./FormFields.js";
import { FormFooter } from "./FormFooter.js";
import { FormStore } from "./FormStore.js";

/**
 * Handler for a clickable `onClick` event.
 * - Returned value (if defined) is notified to the user using `notifySuccess()`
 * - Thrown value is notified to the user using `notifyError()`
 */
export type FormCallback<T extends Data> = (
	data: T,
	event: SubmitEvent<HTMLFormElement>,
) => ReactNode | void | PromiseLike<ReactNode | void>;

export interface FormProps<T extends Data> {
	/** Schema for the form. */
	schema: DataSchema<T>;
	/** Initial data for the form. */
	data?: PartialData<T> | undefined;
	/** Content of the submit button. */
	submit?: ReactNode | undefined;
	/** Optional function called when the form is submitted. Takes the current (validated) value of the form, processes it (possibly asynchronously) and returns any new values to set in the form. */
	onSubmit?: FormCallback<T> | undefined;
	/** Initial set of messages for the form as either a dictionary or a string with `fieldName:` style messages. */
	messages?: ImmutableDictionary<string> | string | undefined;
	/**
	 * Children for the form (defaults to showing `<FormFields>` then `<FormFooter>`
	 * - Note: if defining this manually, ensure you include a `<SubmitButton>` and somewhere in the form.
	 * - Note: if defining this manually, ensure you include a `<FormNotice>`, `<FormMessage>` or `<FormNotify>` somewhere somewhere in the form.
	 */
	children?: ReactNode | undefined;
}

export function Form<T extends Data>(props: FormProps<T>): ReactElement;
export function Form({
	schema,
	data: initialData,
	onSubmit,
	submit,
	messages,
	children = (
		<>
			<FormFields />
			<FormFooter submit={submit} />
		</>
	),
}: FormProps<Data>): ReactElement {
	// Create a form store instance and subscribe to changes in it.
	const store = useStore(useInstance(FormStore, schema, initialData, messages));
	const busy = useStore(store.busy).value;

	return (
		<form
			id={store.id}
			key={store.key}
			onSubmit={async e => {
				// Stop the page reloading.
				e.preventDefault();

				// Get relevant elements.
				const form = e.currentTarget;
				const dialog = form.closest("dialog");

				// Submit the form to the callback.
				const result = await store.submit(callNotifiedForm, store, form, onSubmit, e);

				// Close the parent dialog on successful submit.
				if (result) dialog?.close();
			}}
			className={styles.form}
			noValidate={true}
		>
			<fieldset className={styles.fieldset} disabled={busy}>
				<FormContext value={store}>{children}</FormContext>
			</fieldset>
		</form>
	);
}

/** Callback that publishes notices to an element (defaults to the window) if it returns or throws "string" */
export function callNotifiedForm<T extends Data, A extends Arguments>(
	value: T,
	store: FormStore<T>,
	form: HTMLFormElement,
	callback?: NoticeCallback<[T, ...A]>,
	...args: A
): boolean | Promise<boolean> {
	try {
		const result = callback?.(value, ...args);
		if (isAsync(result)) return awaitNotifiedForm(store, form, result);
		if (result) notifySuccess(result, form);
		return true;
	} catch (thrown) {
		return notifyThrownForm(store, form, thrown);
	}
}

/** Await a value that publishes "success" or "error" notices to a form */
export async function awaitNotifiedForm<T extends Data>(
	store: FormStore<T>,
	form: HTMLFormElement,
	pending: PromiseLike<ReactNode | undefined | void>,
): Promise<boolean> {
	try {
		const result = await pending;
		if (result) notifySuccess(result, form);
		return true;
	} catch (thrown) {
		return notifyThrownForm(store, form, thrown);
	}
}

/** Notify the user about a thrown value during a submit (if thrown value is a string then save it as messages instead. */
export function notifyThrownForm<T extends Data>(store: FormStore<T>, form: HTMLFormElement, thrown: unknown): false {
	store.reason = thrown;
	const reason = store.reason;
	if (reason) notifyThrown(reason, form);
	return false;
}
