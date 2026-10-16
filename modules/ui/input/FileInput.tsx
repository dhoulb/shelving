import type { ReactElement, SyntheticEvent } from "react";
import { type FileCapture, type FileTypes, getFileAccept } from "../../util/file.js";
import { getClass } from "../util/css.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";

/**
 * Props for `FileInput`, an `<input type="file">` that emits the selected `File`.
 *
 * @see https://shelving.cc/ui/FileInputProps
 */
export interface FileInputProps extends ValueInputProps<string | File>, InputVariants {
	/** The file types the picker accepts. */
	types?: FileTypes | undefined;
	/** Which camera the picker opens straight away. On phones this skips the photo library. */
	capture?: FileCapture | undefined;
}

/**
 * File picker input that emits the selected `File` through `onValue`.
 * - The optional `types` dictionary restricts the picker's accepted file types.
 * - The optional `capture` opens the front (`"user"`) or back (`"environment"`) camera straight away.
 *
 * @returns A native `<input type="file">` element.
 * @example <FileInput name="avatar" types={{ png: "image/png" }} onValue={setFile} />
 * @see https://shelving.cc/ui/FileInput
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
	capture,
	className,
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
			accept={getFileAccept(types)}
			capture={capture}
			required={required}
			disabled={disabled}
			placeholder={placeholder}
			className={getClass(getInputClass(variants), className)}
			onChange={onChange}
			multiple={false}
			title={message}
			aria-invalid={!!message}
		/>
	);
}
