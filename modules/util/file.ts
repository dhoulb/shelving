import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/** List of file types in `extension: mime` format. */
export type FileTypes = { [extension: string]: string };

/** Get the file extension from a file path, or return `undefined` if the input has no extension. */
export function getFileExtension(file: string): string | undefined {
	const i = file.lastIndexOf(".");
	return (i >= 0 && file.slice(i + 1)) || undefined;
}

/** Get the file extension from a file path, or throw `RequiredError` if the input has no extension. */
export function requireFileExtension(file: string, caller: AnyCaller = requireFileExtension): string {
	const extension = getFileExtension(file);
	if (!extension) throw new RequiredError("File extension is required", { received: file, caller });
	return extension;
}

/**
 * Split a filename into its base name and extension in a single pass.
 * - Extension includes the leading dot, e.g. `".ts"`.
 * - Returns `undefined` for either part if the filename has no dot or starts with a dot only.
 *
 * @example `splitFileExtension("array.ts")` returns `["array", ".ts"]`
 * @example `splitFileExtension("no-ext")` returns `["no-ext", undefined]`
 * @example `splitFileExtension(".gitignore")` returns `[undefined, ".gitignore"]`
 */
export function splitFileExtension(name: string): [base: string | undefined, extension: string | undefined] {
	const i = name.lastIndexOf(".");
	if (i <= 0) return i === 0 ? [undefined, name] : [name, undefined];
	return [name.slice(0, i), name.slice(i)];
}
