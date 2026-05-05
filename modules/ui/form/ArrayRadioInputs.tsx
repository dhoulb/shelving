import type { ReactElement, ReactNode } from "react";
import { formatValue, type ImmutableArray } from "shelving";
import { Elements } from "../block/Elements.js";
import type { ValueInputProps } from "./Input.js";
import { RadioInput } from "./RadioInput.js";

export interface ArrayRadioInputsProps<T> extends ValueInputProps<T> {
	/** Array of values to show in the list of radios. */
	items: ImmutableArray<T>;
	/** Function that formats an obscure item into a `ReactNode` for display. */
	formatter?: ((value: T) => ReactNode) | undefined;
}

/**
 * Output a list of `<RadioInput>` elements for each item in an array.
 * - The items can be any type, and can be formatted for output through an optional `formatter()` function.
 * - A `placeholder` option is shown at the bottom if `required=false`.
 */
export function ArrayRadioInputs<T>({
	value,
	onValue,
	required = false,
	items,
	formatter = formatValue,
	...props
}: ArrayRadioInputsProps<T>): ReactElement {
	return (
		<Elements column>
			{items.map((v, i) => {
				return (
					<RadioInput //
						key={i.toString()}
						value={value === v}
						onValue={() => onValue(v)}
						required={required}
						{...props}
					>
						{formatter(v)}
					</RadioInput>
				);
			})}
			{!required ? (
				<RadioInput //
					value={!value}
					onValue={() => onValue(undefined)}
					required={required}
					{...props}
				/>
			) : null}
		</Elements>
	);
}
