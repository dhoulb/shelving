import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";

/**
 * List of file types in `extension: mime` format.
 *
 * @see https://dhoulb.github.io/shelving/util/file/FileTypes
 */
export type FileTypes = { [extension: string]: string };

/**
 * Split a filename into its base name and extension in a single pass.
 * - Extension with no leading dot, e.g. `"ts"`.
 * - Returns `undefined` for either part if the filename has no dot or starts with a dot only.
 *
 * @param file The filename to split, or a nullish value (defaults to `""`).
 * @returns A `[base, extension]` tuple, with `undefined` for either part that is absent.
 * @example splitFileExtension("array.ts") // ["array", "ts"]
 * @example splitFileExtension("no-ext") // ["no-ext", undefined]
 * @example splitFileExtension(".gitignore") // [undefined, "gitignore"]
 * @example splitFileExtension(undefined) // [undefined, undefined]
 * @see https://dhoulb.github.io/shelving/util/file/splitFileExtension
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
 * @example getFileExtension("readme.md") // "md"
 * @see https://dhoulb.github.io/shelving/util/file/getFileExtension
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
 * @example requireFileExtension("component.tsx") // "tsx"
 * @see https://dhoulb.github.io/shelving/util/file/requireFileExtension
 */
export function requireFileExtension(file: string, caller: AnyCaller = requireFileExtension): string {
	const extension = getFileExtension(file);
	if (!extension) throw new RequiredError("File extension is required", { received: file, caller });
	return extension;
}
