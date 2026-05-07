import type { ReactElement, SyntheticEvent } from "react";
import { formatNumber } from "../../util/format.js";
import { getNumber } from "../../util/number.js";
import { TEXT_INPUT_CLASS, type ValueInputProps } from "./Input.js";

type NumberFormatter = (num: number) => string;

export interface NumberInputProps extends ValueInputProps<number> {
	min?: number | undefined;
	max?: number | undefined;
	/** Optional formatter — when provided the input switches to `type="text"` and reformats the value on blur. */
	formatter?: NumberFormatter | undefined;
}

export function NumberInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	// min = Number.NEGATIVE_INFINITY,
	// max = Number.POSITIVE_INFINITY,
	formatter = formatNumber,
}: NumberInputProps): ReactElement {
	const onChange = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
		onValue?.(getNumber(currentTarget.value) ?? undefined);
	};

	const onBlur = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
		const num = getNumber(currentTarget.value);
		currentTarget.value = num !== undefined ? formatter(num) : "";
	};

	return (
		<input
			name={name}
			type="text"
			inputMode="decimal"
			defaultValue={value !== undefined ? formatter(value) : ""}
			required={required}
			disabled={disabled}
			placeholder={placeholder || " "}
			className={TEXT_INPUT_CLASS}
			onChange={onChange}
			onInput={onChange}
			onBlur={onBlur}
			title={message}
			aria-invalid={!!message}
		/>
	);
}
