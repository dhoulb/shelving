import type { ReactElement, ReactNode } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import type { Schema } from "../../schema/Schema.js";
import { type PayloadFetchCallback, PayloadFetchStore } from "../../store/PayloadFetchStore.js";
import type { ImmutableArray } from "../../util/array.js";
import { NONE, SECOND } from "../../util/constants.js";
import { formatValue } from "../../util/format.js";
import { ErrorNotice } from "../misc/Catcher.js";
import { LOADING_NOTICE, Notice } from "../notice/Notice.js";
import { ArrayRadioInputs } from "./ArrayRadioInputs.js";
import type { ValueInputProps } from "./Input.js";
import { Popover } from "./Popover.js";
import { SchemaInput } from "./SchemaInput.js";

export interface QueryInputProps<I, O> extends ValueInputProps<O> {
	/** Schema input */
	schema: Schema<I>;

	/**
	 * Called with the current text value to return matching items whenever the text input changes.
	 * - Automatically debounced, so only called after a short delay.
	 * - Automatically shows a loading state while loading.
	 * - Returning `undefined` signals to close the popover.
	 */
	onQuery: PayloadFetchCallback<I, ImmutableArray<O> | undefined>;

	/**
	 * Format an item of type `O` for display in the picker.
	 * @param value The `T` value of an item returned by `onQuery()`, or `undefined` if a non-value was supplied.
	 * - `undefined`
	 */
	formatter?: ((value: O) => string) | undefined;

	/** Message that shows when query returns `[]` empty array (set to `""` empty string to show no message). */
	empty?: ReactNode | undefined;
}

/**
 * Combo box with query input.
 * - Show an input based on a `schema` of type `I`
 * - Values from the input are piped to an `onQuery()` callback.
 * - Show a `<Popover>` that has a radio list of items to allow a final option of type `O` to be picked.
 * - Errors / loading state / empty state are handled automatically.
 */
export function QueryInput<I, O>({
	empty = "No results",
	value,
	onValue,
	onQuery,
	formatter = formatValue,
	...props
}: QueryInputProps<I, O>): ReactElement {
	const store = useStore(useInstance(PayloadFetchStore, NONE, undefined, onQuery, SECOND));
	const busy = useStore(store.busy).value;

	// Is popover open?
	const isOpen = busy || !!store.reason || !!store.value;

	const close = () => {
		store.payload.value = NONE;
		store.value = undefined;
	};

	return (
		<Popover open={isOpen} onClose={close}>
			<SchemaInput
				{...props}
				value={value as I}
				onValue={v => {
					if (v) store.payload.value = v;
					else close();
				}}
			/>
			{busy ? (
				LOADING_NOTICE
			) : store.reason ? (
				<ErrorNotice reason={store.reason} />
			) : store.value?.length ? (
				<ArrayRadioInputs
					items={store.value}
					onValue={v => {
						onValue(v); // Set the value.
						close();
					}}
					formatter={formatter}
					{...props}
				/>
			) : empty ? (
				<Notice status="quiet">{empty}</Notice>
			) : null}
		</Popover>
	);
}
