import { RequiredError } from "../error/RequiredError.js";

/** List of file types in `extension: mime` format. */
export type FileTypes = { [extension: string]: string };

/** Get the file extension from a file path, or return `undefined` if the input has no extension. */
export function getFileExtension(file: string): string | undefined {
	const i = file.lastIndexOf(".");
	return (i >= 0 && file.slice(i + 1)) || undefined;
}

/** Get the file extension from a file path, or throw `RequiredError` if the input has no extension. */
export function requireFileExtension(path: string): string {
	const extension = getFileExtension(path);
	if (!extension) throw new RequiredError("File extension is required", { received: path, caller: requireFileExtension });
	return extension;
}
