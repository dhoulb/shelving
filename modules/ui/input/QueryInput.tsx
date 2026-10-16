import { type ReactElement, type ReactNode, useEffect } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import type { Schema } from "../../schema/Schema.js";
import { type PayloadFetchCallback, PayloadFetchStore } from "../../store/PayloadFetchStore.js";
import type { ImmutableArray } from "../../util/array.js";
import { NONE, SECOND } from "../../util/constants.js";
import { formatValue } from "../../util/format.js";
import { Column } from "../block/Column.js";
import { ErrorNotice } from "../misc/Catcher.js";
import { LOADING_NOTICE, Notice } from "../notice/Notice.js";
import { ArrayRadioInputs } from "./ArrayRadioInputs.js";
import type { ValueInputProps } from "./Input.js";
import { Popover } from "./Popover.js";
import { SchemaInput } from "./SchemaInput.js";

/**
 * Props for `QueryInput`, a combo box that queries items of type `O` from an input of type `I`.
 *
 * @see https://shelving.cc/ui/QueryInputProps
 */
export interface QueryInputProps<I, O> extends ValueInputProps<O> {
	/** Schema input */
	schema: Schema<I>;

	/**
	 * Called with the current text value to return matching items whenever the text input changes.
	 * - Automatically debounced, so only called after a short delay.
	 * - Automatically shows a loading state while loading.
	 * - Returning `undefined` signals to close the popover (or, with `popover={false}`, to show no list).
	 */
	onQuery: PayloadFetchCallback<I, ImmutableArray<O> | undefined>;

	/** Format an item of type `O` for display in the picker, for example as text or as an avatar. */
	formatter?: ((value: O) => ReactNode) | undefined;

	/**
	 * Show the results in a popover (the default), or set `false` to show them inline, as a list below the input.
	 * - Inline, the list shows at once: `onQuery()` is called with the schema's default value (e.g. `""`) on mount.
	 * - Inline, an empty input still queries, and picking an item keeps the list.
	 */
	popover?: boolean | undefined;

	/** Message that shows when query returns `[]` empty array (set to `""` empty string to show no message). */
	empty?: ReactNode | undefined;
}

/**
 * Combo box that queries a list of items and lets the user pick one from a popover.
 * - Shows an input based on a `schema` of type `I`; its values are piped to the `onQuery()` callback.
 * - Shows a `<Popover>` with a radio list of returned items to pick a final value of type `O`.
 * - With `popover={false}`, shows the radio list inline below the input instead, like a `<select>` list box.
 * - Errors, loading, and empty states are handled automatically.
 *
 * @returns A combo box element wrapping the input and results popover (or the inline list).
 * @example <QueryInput schema={SEARCH} onQuery={search} value={user} onValue={setUser} />
 * @example <QueryInput popover={false} schema={SEARCH} onQuery={search} value={user} onValue={setUser} />
 * @see https://shelving.cc/ui/QueryInput
 */
export function QueryInput<I, O>({
	empty = "No results",
	value,
	onValue,
	onQuery,
	formatter = formatValue,
	popover = true,
	className,
	...props
}: QueryInputProps<I, O>): ReactElement {
	const store = useStore(useInstance(PayloadFetchStore, NONE, undefined, onQuery, SECOND));
	const busy = useStore(store.busy).value;

	// Inline, query the schema's default value at once, so the list shows before anything is typed.
	useEffect(() => {
		if (!popover) store.payload.value = props.schema.value as I;
	}, [popover, store, props.schema]);

	// Is popover open?
	const isOpen = busy || !!store.reason || !!store.value;

	const close = () => {
		store.payload.value = NONE;
		store.value = undefined;
	};

	const results = busy ? (
		LOADING_NOTICE
	) : store.reason ? (
		<ErrorNotice reason={store.reason} />
	) : store.value?.length ? (
		<ArrayRadioInputs
			items={store.value}
			onValue={v => {
				onValue(v); // Set the value.
				if (popover) close();
			}}
			formatter={formatter}
			{...props}
		/>
	) : empty && store.value ? (
		<Notice>{empty}</Notice>
	) : null;

	if (!popover)
		return (
			<Column>
				<SchemaInput {...props} className={className} value={value as I} onValue={v => void (store.payload.value = v as I)} />
				{results}
			</Column>
		);

	return (
		<Popover open={isOpen} onClose={close}>
			<SchemaInput
				{...props}
				className={className}
				value={value as I}
				onValue={v => {
					if (v) store.payload.value = v;
					else close();
				}}
			/>
			{results}
		</Popover>
	);
}
