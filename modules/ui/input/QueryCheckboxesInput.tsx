import type { ReactElement } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { formatValue } from "../../util/format.js";
import { ArrayCheckboxInputs } from "./ArrayCheckboxInputs.js";
import type { ValueInputProps } from "./Input.js";
import { QueryInputBase, type QueryInputBaseProps } from "./QueryInputBase.js";

/**
 * Props for `QueryCheckboxesInput`, a combo box that queries items of type `O` from an input of type `I`, and picks any number of them.
 *
 * @see https://shelving.cc/ui/QueryCheckboxesInputProps
 */
export interface QueryCheckboxesInputProps<I, O> extends QueryInputBaseProps<I, O>, ValueInputProps<ImmutableArray<O>> {}

/**
 * Combo box that queries a list of items and lets the user pick any number of them, with checkboxes.
 * - Shows an input based on a `schema` of type `I`; its values are piped to the `onQuery()` callback.
 * - Shows a `<Popover>` with a checkbox list of returned items. The value is the array of checked items. The popover stays open while the user checks items.
 * - With `popover={false}`, shows the checkbox list inline below the input instead.
 * - Checked items stay checked when a new query does not return them. Items are compared with `===`, so `onQuery()` must return the same objects each time (or primitives).
 * - Errors, loading, and empty states are handled automatically.
 *
 * @kind component
 * @returns A combo box element wrapping the input and results popover (or the inline list).
 * @see https://shelving.cc/ui/QueryCheckboxesInput
 */
export function QueryCheckboxesInput<I, O>({
	value,
	onValue,
	formatter = formatValue,
	...props
}: QueryCheckboxesInputProps<I, O>): ReactElement {
	const { name, required, disabled } = props;
	return (
		<QueryInputBase<I, O>
			{...props}
			list={items => (
				<ArrayCheckboxInputs
					name={name}
					required={required}
					disabled={disabled}
					items={items}
					value={value}
					formatter={formatter}
					onValue={onValue}
				/>
			)}
		/>
	);
}
