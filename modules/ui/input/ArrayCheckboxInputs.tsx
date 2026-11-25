import type { ReactElement, ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { formatValue } from "../../util/format.js";
import { Column } from "../block/Column.js";
import { CheckboxInput } from "./CheckboxInput.js";
import type { ValueInputProps } from "./Input.js";

/**
 * Props for `ArrayCheckboxInputs`, which renders a checkbox for each item in an array of values.
 *
 * @see https://shelving.cc/ui/ArrayCheckboxInputsProps
 */
export interface ArrayCheckboxInputsProps<T> extends ValueInputProps<ImmutableArray<T>> {
	/** Array of values to show in the list of checkboxes. */
	items: ImmutableArray<T>;
	/** Function that formats an obscure item into a `ReactNode` for display. */
	formatter?: ((value: T) => ReactNode) | undefined;
}

/**
 * Output a list of `<CheckboxInput>` elements for each item in an array, to pick any number of them.
 * - The value is the array of checked items, in the order they were checked.
 * - Items are compared with `===`, or by `id` when both are objects with an `id` property, so a new copy of a checked item stays checked.
 * - Checked items that are not in `items` stay in the value.
 * - The items can be any type, and can be formatted for output through an optional `formatter()` function.
 *
 * @kind component
 * @returns Element rendering one checkbox per item.
 * @see https://shelving.cc/ui/ArrayCheckboxInputs
 */
export function ArrayCheckboxInputs<T>({
	value = [],
	onValue,
	required = false,
	items,
	formatter = formatValue,
	className,
	...props
}: ArrayCheckboxInputsProps<T>): ReactElement {
	return (
		<Column className={className}>
			{items.map((v, i) => {
				const checked = value.some(x => _isSame(x, v));
				return (
					<CheckboxInput //
						// The checkbox is uncontrolled, so the key includes `checked` to remount it when the value changes.
						key={`${i.toString()}:${checked ? "on" : "off"}`}
						value={checked}
						onValue={on => onValue(on ? [...value, v] : value.filter(x => !_isSame(x, v)))}
						required={required && !value.length}
						{...props}
					>
						{formatter(v)}
					</CheckboxInput>
				);
			})}
		</Column>
	);
}

/** Are two items the same item: the same value, or two objects with the same `id`? */
function _isSame(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (typeof a !== "object" || typeof b !== "object" || !a || !b || !("id" in a) || !("id" in b)) return false;
	return a.id === b.id;
}
