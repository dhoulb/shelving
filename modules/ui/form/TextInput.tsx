import type { ReactElement, SyntheticEvent } from "react";
import { PASSTHROUGH, type StringInputType } from "shelving";
import { MULTILINE_TEXT_INPUT_CLASS, TEXT_INPUT_CLASS, type ValueInputProps } from "./Input.js";

type TextFormatter = (str: string) => string;

export interface TextInputProps extends ValueInputProps<string> {
	rows?: number | undefined;
	multiline?: boolean;
	input?: StringInputType;
	min?: number | undefined;
	max?: number | undefined;
	/** Optional formatter — when provided the value is reformatted on blur and when initially displayed. */
	formatter?: TextFormatter | undefined;
}

export function TextInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	input = "text",
	min = 0,
	max = Number.POSITIVE_INFINITY,
	rows = 1,
	formatter = PASSTHROUGH,
}: TextInputProps): ReactElement {
	const onBlur = ({ currentTarget }: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		currentTarget.value = formatter(currentTarget.value);
	};

	if (rows > 1) {
		const onChange = (e: SyntheticEvent<HTMLTextAreaElement>) => {
			onValue?.(formatter(e.currentTarget.value));
			_resize(e.currentTarget, rows);
		};

		return (
			<textarea
				ref={el => void (el && _resize(el, rows))}
				name={name}
				defaultValue={value !== undefined ? formatter(value) : ""}
				minLength={Number.isFinite(min) ? min : 0}
				maxLength={Number.isFinite(max) ? max : undefined}
				rows={rows}
				required={required && min > 0}
				disabled={disabled}
				placeholder={placeholder || " "}
				className={MULTILINE_TEXT_INPUT_CLASS}
				onInput={onChange}
				onChange={onChange}
				onBlur={onBlur}
				title={message}
				aria-invalid={!!message}
			/>
		);
	}

	const onChange = (e: SyntheticEvent<HTMLInputElement>) => {
		onValue?.(formatter(e.currentTarget.value));
	};

	return (
		<input
			name={name}
			type={input}
			defaultValue={value !== undefined ? formatter(value) : ""}
			minLength={Number.isFinite(min) ? min : 0}
			maxLength={Number.isFinite(max) ? max : undefined}
			required={required && min > 0}
			disabled={disabled}
			placeholder={placeholder || " "}
			className={TEXT_INPUT_CLASS}
			onInput={onChange}
			onChange={onChange}
			onBlur={onBlur}
			title={message}
			aria-invalid={!!message}
		/>
	);
}

/**
 * @todo This can be removed when Firefox supports `field-sizing:` in CSS.
 *   https://caniuse.com/wf-field-sizing
 */
function _resize(el: HTMLTextAreaElement, minRows: number): void {
	if (el && !CSS.supports("field-sizing", "content")) {
		el.rows = minRows;
		while (el.scrollHeight > el.clientHeight) el.rows++;
	}
}
