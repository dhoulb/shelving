import type { ReactElement } from "react";
import type { ChoiceOptions } from "../../schema/ChoiceSchema.js";
import { getProps } from "../../util/object.js";
import { Row } from "../style/Flex.js";
import type { ValueInputProps } from "./Input.js";
import { RadioInput } from "./RadioInput.js";

/** Maximum number of options to show in a row. */
const MAX_ROW_OPTIONS = 2;

/**
 * Props for `ChoiceRadioInputs`, which renders a radio for each entry in a [`ChoiceOptions`](/schema/ChoiceOptions) set.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/ChoiceRadioInputs/ChoiceRadioInputsProps
 */
export interface ChoiceRadioInputsProps<T extends string> extends ValueInputProps<T> {
	/** Options for the radios. */
	options: ChoiceOptions<T>;
	/** Wrap the radios onto multiple rows if needed. */
	wrap?: boolean;
	/** Display the radios in a column rather than a row. */
	column?: boolean;
}

/**
 * Output a list of [`<RadioInput>`](/ui/RadioInput) elements for each item in a set of [`ChoiceOptions`](/schema/ChoiceOptions) in `{ key: title }` format.
 * - This is the same type a [`ChoiceSchema`](/schema/ChoiceSchema) uses for its `.options` field.
 * - A `placeholder` option is shown at the bottom if `required=false`.
 *
 * @returns Element rendering one radio per option plus an optional empty placeholder radio.
 * @kind component
 * @example <ChoiceRadioInputs name="role" options={{ admin: "Admin", user: "User" }} value={role} onValue={setRole} />
 * @see https://dhoulb.github.io/shelving/ui/form/ChoiceRadioInputs/ChoiceRadioInputs
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
		<Row wrap={wrap} column={column ?? hasMany}>
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
		</Row>
	);
}
