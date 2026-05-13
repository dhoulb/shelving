import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";
import type { Nullish } from "./null.js";

/** List of file types in `extension: mime` format. */
export type FileTypes = { [extension: string]: string };

/**
 * Split a filename into its base name and extension in a single pass.
 * - Extension with no leading dot, e.g. `"ts"`.
 * - Returns `undefined` for either part if the filename has no dot or starts with a dot only.
 *
 * @example `splitFileExtension("array.ts")` returns `["array", ".ts"]`
 * @example `splitFileExtension("no-ext")` returns `["no-ext", undefined]`
 * @example `splitFileExtension(".gitignore")` returns `[undefined, "gitignore"]`
 * @example `splitFileExtension(undefined)` returns `[undefined, undefined]`
 */
export function splitFileExtension(file: Nullish<string> = ""): [base: string | undefined, extension: string | undefined] {
	if (!file) return [undefined, undefined];
	const i = file.lastIndexOf(".");
	if (i < 0) return [file, undefined];
	return [file.slice(0, i) || undefined, file.slice(i + 1) || undefined];
}

/** Get the file extension from a file path, e.g. `"md"`, or return `undefined` if the input has no extension. */
export function getFileExtension(file: Nullish<string>): string | undefined {
	return splitFileExtension(file)[1];
}

/** Get the file extension from a file path e.g. `"tsx"`, or throw `RequiredError` if the input has no extension. */
export function requireFileExtension(file: string, caller: AnyCaller = requireFileExtension): string {
	const extension = getFileExtension(file);
	if (!extension) throw new RequiredError("File extension is required", { received: file, caller });
	return extension;
}
