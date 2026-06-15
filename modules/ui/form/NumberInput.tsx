import type { ReactElement, SyntheticEvent } from "react";
import { formatNumber } from "../../util/format.js";
import { getNumber } from "../../util/number.js";
import { getClass } from "../util/css.js";
import { getInputClass, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

type NumberFormatter = (num: number) => string;

/**
 * Props for `NumberInput`, a text-based numeric input bound to a `number` value.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/NumberInput/NumberInputProps
 */
export interface NumberInputProps extends ValueInputProps<number> {
	min?: number | undefined;
	max?: number | undefined;
	/** Optional formatter — when provided the input switches to `type="text"` and reformats the value on blur. */
	formatter?: NumberFormatter | undefined;
}

/**
 * Numeric input bound to a `number` value, parsing typed text and reformatting it on blur.
 * - Uses `type="text"` with `inputMode="decimal"` so a custom `formatter` can control display.
 *
 * @param props Props including `value`, `onValue`, optional `min`/`max`, and a `formatter`.
 * @returns A numeric `<input>` element.
 * @example <NumberInput name="age" value={age} onValue={setAge} />
 * @see https://dhoulb.github.io/shelving/ui/form/NumberInput/NumberInput
 */
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
			className={getClass(getInputClass(), INPUT_CSS.text)}
			onChange={onChange}
			onInput={onChange}
			onBlur={onBlur}
			title={message}
			aria-invalid={!!message}
		/>
	);
}
