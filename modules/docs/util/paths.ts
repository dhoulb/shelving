import { posix, resolve as resolvePath } from "node:path";

export function stripExtension(path: string): string {
	const parsed = posix.parse(path);
	return posix.join(parsed.dir, parsed.name);
}

export function resolveOutputPath(outputRoot: string, logicalPath: string): string {
	return resolvePath(outputRoot, logicalPath, "index.html");
}

export function relativeHref(fromPath: string, toPath: string): string {
	const fromDir = fromPath ? posix.dirname(fromPath) : ".";
	const rel = posix.relative(fromDir, toPath || ".");
	const suffix = rel.endsWith("/") || rel === "" ? rel : `${rel}/`;
	return suffix || "./";
}
