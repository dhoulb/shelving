import type { ReactElement, SyntheticEvent } from "react";
import type { FileTypes } from "shelving";
import { INPUT_CLASS, type ValueInputProps } from "./Input.js";

export interface FileInputProps extends ValueInputProps<string | File> {
	types?: FileTypes | undefined;
}

export function FileInput({
	name,
	title,
	placeholder = title,
	required = false,
	disabled = false,
	message,
	// value,
	onValue,
	types = {},
}: FileInputProps): ReactElement {
	const onChange = (e: SyntheticEvent<HTMLInputElement>) => {
		const files = e.currentTarget.files;
		if (files) for (const file of files) onValue(file);
	};

	return (
		<input
			name={name}
			type="file"
			accept={Object.values(types).join(",")}
			required={required}
			disabled={disabled}
			placeholder={placeholder}
			className={INPUT_CLASS}
			onChange={onChange}
			onInput={onChange}
			multiple={false}
			title={message}
			aria-invalid={!!message}
		/>
	);
}
