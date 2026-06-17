import type { ReactElement, SyntheticEvent } from "react";
import type { FileTypes } from "../../util/file.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";

/**
 * Props for `FileInput`, an `<input type="file">` that emits the selected `File`.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/FileInput/FileInputProps
 */
export interface FileInputProps extends ValueInputProps<string | File>, InputVariants {
	types?: FileTypes | undefined;
}

/**
 * File picker input that emits the selected `File` through `onValue`.
 * - The optional `types` dictionary restricts the picker's accepted file types.
 *
 * @returns A native `<input type="file">` element.
 * @example <FileInput name="avatar" types={{ png: "image/png" }} onValue={setFile} />
 * @see https://dhoulb.github.io/shelving/ui/form/FileInput/FileInput
 */
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
	...variants
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
			className={getInputClass(variants)}
			onChange={onChange}
			onInput={onChange}
			multiple={false}
			title={message}
			aria-invalid={!!message}
		/>
	);
}
