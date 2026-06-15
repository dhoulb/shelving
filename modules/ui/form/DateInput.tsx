import type { ReactElement, SyntheticEvent } from "react";
import type { DateInputType } from "../../schema/DateSchema.js";
import { getDateString, getDateTimeString, getTimeString, type PossibleDate } from "../../util/date.js";
import { getClass } from "../util/css.js";
import { getInputClass, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/** Convert a `PossibleDate` to a string for a specific date `<input type="etc">` type. */
const _DATE_TO_STRING: { [K in DateInputType]: (d: PossibleDate | undefined) => string | undefined } = {
	"datetime-local": getDateTimeString, // ISO 8601 without timezone, e.g. "2024-01-01T12:00:00"
	date: getDateString, // YYYY-MM-DD
	time: getTimeString, // HH:MM:SS
};

/**
 * Props for `DateInput`, a date/time `<input>` that emits an ISO string value.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/DateInput/DateInputProps
 */
export interface DateInputProps extends ValueInputProps<string, PossibleDate> {
	min?: PossibleDate | undefined;
	max?: PossibleDate | undefined;
	input?: DateInputType | undefined;
	step?: number | undefined;
}

/**
 * Date, time, or datetime input that accepts a `PossibleDate` and emits an ISO string value.
 * - The `input` prop selects the underlying `<input type="date|time|datetime-local">` and matching string format.
 *
 * @param props Props including `value`, `onValue`, optional `min`/`max` bounds, `input` type, and `step`.
 * @returns A native date/time `<input>` element.
 * @example <DateInput name="dob" input="date" value={dob} onValue={setDob} />
 * @see https://dhoulb.github.io/shelving/ui/form/DateInput/DateInput
 */
export function DateInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	min,
	max,
	input = "date",
	step,
}: DateInputProps): ReactElement {
	const onChange = (e: SyntheticEvent<HTMLInputElement>) => {
		onValue?.(e.currentTarget.value ?? undefined);
	};

	const dateToString = _DATE_TO_STRING[input];

	return (
		<input
			name={name}
			type={input}
			min={dateToString(min)}
			max={dateToString(max)}
			disabled={disabled}
			required={required}
			defaultValue={dateToString(value)}
			placeholder={placeholder || " "}
			className={getClass(getInputClass(), INPUT_CSS.text)}
			onChange={onChange}
			onInput={onChange}
			title={message}
			aria-invalid={!!message}
			step={step}
		/>
	);
}
