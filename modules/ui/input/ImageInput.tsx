import { XMarkIcon } from "@heroicons/react/24/solid";
import { type MouseEvent, type ReactElement, type SyntheticEvent, useEffect, useMemo } from "react";
import type { FileTypes } from "../../util/file.js";
import { getButtonClass } from "../button/Button.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import IMAGE_INPUT_CSS from "./ImageInput.module.css";
import type { ValueInputProps } from "./Input.js";

const IMAGE_INPUT_CLASS = getModuleClass(IMAGE_INPUT_CSS, "image-input");
const IMAGE_INPUT_PICKER_CLASS = getModuleClass(IMAGE_INPUT_CSS, "picker");
const IMAGE_INPUT_PREVIEW_CLASS = getModuleClass(IMAGE_INPUT_CSS, "preview");
const IMAGE_INPUT_FILE_CLASS = getModuleClass(IMAGE_INPUT_CSS, "file");
const IMAGE_INPUT_CHOOSE_CLASS = getClass(getButtonClass({ solid: true }), getModuleClass(IMAGE_INPUT_CSS, "choose"));
const IMAGE_INPUT_CLEAR_CLASS = getClass(getButtonClass({ solid: true, small: true }), getModuleClass(IMAGE_INPUT_CSS, "clear"));

/** The image types the picker accepts by default. */
const IMAGE_TYPES: FileTypes = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

/**
 * Props for `<ImageInput>`, a square image picker that emits the picked `File`.
 *
 * @see https://shelving.cc/ui/ImageInputProps
 */
export interface ImageInputProps extends ValueInputProps<File, string>, BlockVariants {
	/**
	 * The image types the picker accepts.
	 * @default { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }
	 */
	types?: FileTypes | undefined;
}

/**
 * Square image picker that shows the picked image in the square.
 * - With no image, the square shows a "Choose…" button in the middle (change it with `placeholder`).
 * - With an image, the image fills the square and an X button in the corner clears it (`onValue(undefined)`).
 * - A tap anywhere on the square opens the file picker.
 * - `value` is a picked `File`, or the URL of the current image.
 *
 * @kind component
 * @see https://shelving.cc/ui/ImageInput
 */
export function ImageInput({
	name,
	title = "Image",
	placeholder = "Choose…",
	required = false,
	disabled = false,
	message,
	value,
	onValue,
	types = IMAGE_TYPES,
	className,
	...variants
}: ImageInputProps): ReactElement {
	const onChange = (e: SyntheticEvent<HTMLInputElement>) => {
		const file = e.currentTarget.files?.[0];
		if (file) onValue(file);
	};
	const onClear = ({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
		// Empty the native input too, so picking the same file again still fires `change`.
		const input = currentTarget.parentElement?.querySelector("input");
		if (input) input.value = "";
		onValue(undefined);
	};
	return (
		<div className={getClass(IMAGE_INPUT_CLASS, getBlockClass(variants), className)}>
			<label className={IMAGE_INPUT_PICKER_CLASS} title={message} aria-invalid={!!message}>
				{value ? <ImageInputPreview value={value} /> : <span className={IMAGE_INPUT_CHOOSE_CLASS}>{placeholder}</span>}
				<input
					name={name}
					type="file"
					accept={Object.values(types).join(",")}
					required={required && !value}
					disabled={disabled}
					aria-label={title}
					className={IMAGE_INPUT_FILE_CLASS}
					onChange={onChange}
				/>
			</label>
			{value && !disabled && (
				<button type="button" title="Clear" className={IMAGE_INPUT_CLEAR_CLASS} onClick={onClear}>
					<XMarkIcon />
				</button>
			)}
		</div>
	);
}

/** The image in the square: a URL as is, or a picked `File` through an object URL that is freed when it changes. */
function ImageInputPreview({ value }: { readonly value: File | string }): ReactElement {
	const src = useMemo(() => (typeof value === "string" ? value : URL.createObjectURL(value)), [value]);
	useEffect(
		() => () => {
			if (typeof value !== "string") URL.revokeObjectURL(src);
		},
		[value, src],
	);
	return <img src={src} alt="" className={IMAGE_INPUT_PREVIEW_CLASS} />;
}
