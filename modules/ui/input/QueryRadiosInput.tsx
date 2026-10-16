import type { ReactElement } from "react";
import { formatValue } from "../../util/format.js";
import { ArrayRadioInputs } from "./ArrayRadioInputs.js";
import type { ValueInputProps } from "./Input.js";
import { QueryInputBase, type QueryInputBaseProps } from "./QueryInputBase.js";

/**
 * Props for `QueryRadiosInput`, a combo box that queries items of type `O` from an input of type `I`, and picks one.
 *
 * @see https://shelving.cc/ui/QueryRadiosInputProps
 */
export interface QueryRadiosInputProps<I, O> extends QueryInputBaseProps<I, O>, ValueInputProps<O> {}

/**
 * Combo box that queries a list of items and lets the user pick one, with radios.
 * - Shows an input based on a `schema` of type `I`; its values are piped to the `onQuery()` callback.
 * - Shows a `<Popover>` with a radio list of returned items to pick a final value of type `O`. Picking an item closes the popover.
 * - With `popover={false}`, shows the radio list inline below the input instead, like a `<select>` list box.
 * - Errors, loading, and empty states are handled automatically.
 *
 * @kind component
 * @returns A combo box element wrapping the input and results popover (or the inline list).
 * @see https://shelving.cc/ui/QueryRadiosInput
 */
export function QueryRadiosInput<I, O>({
	value,
	onValue,
	formatter = formatValue,
	popover = true,
	...props
}: QueryRadiosInputProps<I, O>): ReactElement {
	const { name, required, disabled } = props;
	return (
		<QueryInputBase<I, O>
			{...props}
			popover={popover}
			list={(items, close) => (
				<ArrayRadioInputs
					name={name}
					required={required}
					disabled={disabled}
					items={items}
					value={value}
					formatter={formatter}
					onValue={v => {
						onValue(v);
						if (popover) close();
					}}
				/>
			)}
		/>
	);
}
