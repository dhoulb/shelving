import { ValidationError } from "../error/ValidationError.js";

/** List of file types in `extension: mime` format. */
export type FileTypes = { [extension: string]: string };

/** Get the file extension from a file path, or return `undefined` if the input has no extension. */
export function getOptionalFileExtension(file: string): string | undefined {
	const i = file.lastIndexOf(".");
	return (i >= 0 && file.slice(i + 1)) || undefined;
}

/** Get the file extension from a file path, or throw `ValueError` if the input has no extension. */
export function getFileExtension(path: string): string {
	const extension = getOptionalFileExtension(path);
	if (!extension) throw new ValidationError("File extension is required", path);
	return extension;
}
