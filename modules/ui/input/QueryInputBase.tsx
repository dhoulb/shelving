import { type ReactElement, type ReactNode, useEffect, useRef } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import type { Schema } from "../../schema/Schema.js";
import { type PayloadFetchCallback, PayloadFetchStore } from "../../store/PayloadFetchStore.js";
import type { ImmutableArray } from "../../util/array.js";
import { NONE, SECOND } from "../../util/constants.js";
import { Column } from "../block/Column.js";
import { Paragraph } from "../block/Paragraph.js";
import { ErrorNotice } from "../misc/Catcher.js";
import { EMPTY_LOADING, Empty } from "../notice/Empty.js";
import type { InputProps } from "./Input.js";
import { Popover } from "./Popover.js";
import { SchemaInput } from "./SchemaInput.js";

/**
 * Props shared by `QueryRadiosInput` and `QueryCheckboxesInput`.
 *
 * @see https://shelving.cc/ui/QueryInputBaseProps
 */
export interface QueryInputBaseProps<I, O> extends InputProps {
	/** Schema for the text input. Its `one` and `many` name the items, e.g. `one: "user"` shows "No users". */
	schema: Schema<I>;

	/**
	 * Called with the current text value to return matching items whenever the text input changes.
	 * - Automatically debounced, so only called after a short delay.
	 * - Automatically shows a loading state while loading.
	 * - Returning `undefined` signals to close the popover (or, with `popover={false}`, to show no list).
	 */
	onQuery: PayloadFetchCallback<I, ImmutableArray<O> | undefined>;

	/** Format an item of type `O` for display in the list, for example as text or as an avatar. */
	formatter?: ((value: O) => ReactNode) | undefined;

	/**
	 * Show the results in a popover (the default), or set `false` to show them inline, as a list below the input.
	 * - Inline, the list shows at once: `onQuery()` is called with the schema's default value (e.g. `""`) on mount.
	 * - Inline, an empty input still queries.
	 */
	popover?: boolean | undefined;

	/**
	 * Message that shows in an `<Empty>` when the query returns `[]` (set to `""` to show no message).
	 * @default `No ${schema.many}`, e.g. "No users"
	 */
	empty?: ReactNode | undefined;
}

/** Props for the internal `QueryInputBase`: the shared props, plus a function that renders the list of items. */
interface QueryInputBaseFrameProps<I, O> extends QueryInputBaseProps<I, O> {
	/** Render the list for the items the query returned. `close()` closes the popover. */
	list: (items: ImmutableArray<O>, close: () => void) => ReactNode;
}

/**
 * Text input that queries a list of items, then shows the list in a popover or inline.
 * - Shared by `QueryRadiosInput` and `QueryCheckboxesInput`, which each render their own list.
 * - The text input is never required: the picked items are the value, not the text.
 * - The store is kept when the parent renders again with a new `onQuery()`, so the list does not load again.
 * - Errors show in an `<ErrorNotice>`. Loading and empty states show in an `<Empty>`.
 */
export function QueryInputBase<I, O>({
	schema,
	onQuery,
	popover = true,
	empty = `No ${schema.many}`,
	list,
	className,
	...props
}: QueryInputBaseFrameProps<I, O>): ReactElement {
	// Keep one store while the component lives. `onQuery()` is often a new function on each render, so the store calls the latest one through a ref.
	const latest = useRef(onQuery);
	latest.current = onQuery;
	const query = (useRef<typeof onQuery>(undefined).current ??= (payload, signal) => latest.current(payload, signal));
	const store = useStore(useInstance(PayloadFetchStore, NONE, undefined, query, SECOND));
	const busy = useStore(store.busy).value;

	// Inline, query the schema's default value at once, so the list shows before anything is typed.
	useEffect(() => {
		if (!popover) store.payload.value = schema.value as I;
	}, [popover, store, schema]);

	// Is popover open?
	const isOpen = busy || !!store.reason || !!store.value;

	// Close the popover and clear the results.
	const close = () => {
		store.payload.value = NONE;
		store.value = undefined;
	};

	const results = busy ? (
		EMPTY_LOADING
	) : store.reason ? (
		<ErrorNotice reason={store.reason} />
	) : store.value?.length ? (
		list(store.value, close)
	) : empty && store.value ? (
		<Empty>{typeof empty === "string" ? <Paragraph>{empty}</Paragraph> : empty}</Empty>
	) : null;

	if (!popover)
		return (
			<Column>
				<SchemaInput {...props} required={false} schema={schema} className={className} onValue={v => void (store.payload.value = v as I)} />
				{results}
			</Column>
		);

	return (
		<Popover open={isOpen} onClose={close}>
			<SchemaInput
				{...props}
				required={false}
				schema={schema}
				className={className}
				onValue={v => {
					if (v) store.payload.value = v;
					else close();
				}}
			/>
			{results}
		</Popover>
	);
}
