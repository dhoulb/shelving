import type { ReactElement, SyntheticEvent } from "react";
import { type DateInputType, getDateString, getDateTimeString, getTimeString, type PossibleDate } from "shelving";
import { TEXT_INPUT_CLASS, type ValueInputProps } from "./Input.js";

/** Convert a `PossibleDate` to a string for a specific date `<input type="etc">` type. */
const _DATE_TO_STRING: { [K in DateInputType]: (d: PossibleDate | undefined) => string | undefined } = {
	"datetime-local": getDateTimeString, // ISO 8601 without timezone, e.g. "2024-01-01T12:00:00"
	date: getDateString, // YYYY-MM-DD
	time: getTimeString, // HH:MM:SS
};

export interface DateInputProps extends ValueInputProps<string, PossibleDate> {
	min?: PossibleDate | undefined;
	max?: PossibleDate | undefined;
	input?: DateInputType | undefined;
	step?: number | undefined;
}

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
			className={TEXT_INPUT_CLASS}
			onChange={onChange}
			onInput={onChange}
			title={message}
			aria-invalid={!!message}
			step={step}
		/>
	);
}
