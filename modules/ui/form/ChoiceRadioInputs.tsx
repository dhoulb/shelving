import type { ReactElement } from "react";
import { type ChoiceOptions, getProps } from "shelving";
import { Elements } from "../block/Elements.js";
import type { ValueInputProps } from "./Input.js";
import { RadioInput } from "./RadioInput.js";

/** Maximum number of options to show in a row. */
const MAX_ROW_OPTIONS = 3;

export interface ChoiceRadioInputsProps<T extends string> extends ValueInputProps<T> {
	/** Options for the radios. */
	options: ChoiceOptions<T>;
	/** Wrap the radios onto multiple rows if needed. */
	wrap?: boolean;
	/** Display the radios in a column rather than a row. */
	column?: boolean;
}

/**
 * Output a list of `<RadioInput>` elements for each item in a set of `ChoiceOptions` in `{ key: title }` format.
 * - This is the same type a `ChoiceSchema` uses for its `.options` field.
 * - A `placeholder` option is shown at the bottom if `required=false`.
 */
export function ChoiceRadioInputs<T extends string>(props: ChoiceRadioInputsProps<T>): ReactElement;
export function ChoiceRadioInputs({
	required = false,
	value = "",
	onValue,
	wrap = false,
	column,
	options,
	...props
}: ChoiceRadioInputsProps<string>): ReactElement {
	const entries = getProps(options);
	const hasMany = entries.length > MAX_ROW_OPTIONS;
	return (
		<Elements wrap={wrap} column={column ?? hasMany}>
			{entries.map(([k, t]) => (
				<RadioInput //
					key={k}
					value={value === k}
					onValue={() => onValue(k)}
					required={required}
					{...props}
				>
					{t}
				</RadioInput>
			))}
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
