import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";

/**
 * List of file types in `extension: mime` format.
 *
 * @see https://shelving.cc/util/file/FileTypes
 */
export type FileTypes = { [extension: string]: string };

/**
 * Which camera a file picker opens straight away: `"user"` is the front (selfie) camera, `"environment"` the back camera.
 * - Sets the `capture` attribute of `<input type="file">`.
 * - On phones, the picker then opens the camera only, with no photo library.
 *
 * @see https://shelving.cc/util/file/FileCapture
 */
export type FileCapture = "user" | "environment";

/**
 * Image file types in `extension: mime` format: JPEG, PNG, WebP, GIF, and AVIF.
 *
 * @see https://shelving.cc/util/file/IMAGE_TYPES
 */
export const IMAGE_TYPES: FileTypes = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
	gif: "image/gif",
	avif: "image/avif",
};

/**
 * Video file types in `extension: mime` format: MP4, QuickTime, and WebM.
 *
 * @see https://shelving.cc/util/file/VIDEO_TYPES
 */
export const VIDEO_TYPES: FileTypes = {
	mp4: "video/mp4",
	m4v: "video/mp4",
	mov: "video/quicktime",
	webm: "video/webm",
};

/**
 * Media file types in `extension: mime` format: every type in `IMAGE_TYPES` and `VIDEO_TYPES`.
 *
 * @see https://shelving.cc/util/file/MEDIA_TYPES
 */
export const MEDIA_TYPES: FileTypes = { ...IMAGE_TYPES, ...VIDEO_TYPES };

/**
 * Get the `accept` attribute of a file input for a set of file types, e.g. `"image/jpeg,image/png"`.
 * - Each MIME type shows once, even when two extensions share it.
 *
 * @param types The allowed file types.
 * @returns A comma-separated list of MIME types.
 * @see https://shelving.cc/util/file/getFileAccept
 */
export function getFileAccept(types: FileTypes): string {
	return Array.from(new Set(Object.values(types))).join(",");
}

/**
 * Split a filename into its base name and extension in a single pass.
 * - Extension with no leading dot, e.g. `"ts"`.
 * - Returns `undefined` for either part if the filename has no dot or starts with a dot only.
 *
 * @param file The filename to split, or a nullish value (defaults to `""`).
 * @returns A `[base, extension]` tuple, with `undefined` for either part that is absent.
 * @see https://shelving.cc/util/file/splitFileExtension
 */
export function splitFileExtension(file: Nullish<string> = ""): [base: string | undefined, extension: string | undefined] {
	if (!file) return [undefined, undefined];
	const i = file.lastIndexOf(".");
	if (i < 0) return [file, undefined];
	return [file.slice(0, i) || undefined, file.slice(i + 1) || undefined];
}

/**
 * Get the file extension from a file path, e.g. `"md"`, or return `undefined` if the input has no extension.
 *
 * @param file The filename to read the extension from, or a nullish value.
 * @returns The extension (no leading dot), or `undefined` if the input has no extension.
 * @see https://shelving.cc/util/file/getFileExtension
 */
export function getFileExtension(file: Nullish<string>): string | undefined {
	return splitFileExtension(file)[1];
}

/**
 * Get the file extension from a file path e.g. `"tsx"`, or throw `RequiredError` if the input has no extension.
 *
 * @param file The filename to read the extension from.
 * @param caller Function to attribute a thrown error to (defaults to `requireFileExtension`).
 * @returns The extension (no leading dot).
 * @throws `RequiredError` if the input has no extension.
 * @see https://shelving.cc/util/file/requireFileExtension
 */
export function requireFileExtension(file: string, caller: AnyCaller = requireFileExtension): string {
	const extension = getFileExtension(file);
	if (!extension) throw new RequiredError("File extension is required", { received: file, caller });
	return extension;
}
