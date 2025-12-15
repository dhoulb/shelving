import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import ts from "typescript";
import type { PathNode } from "./nodes.js";
import { getSourceFileDocblock, getSourceFileSymbols } from "./typescript.js";

const EXTENSION_SCRIPT_KIND: { [ext: string]: ts.ScriptKind } = {
	".js": ts.ScriptKind.JS,
	".jsx": ts.ScriptKind.JSX,
	".ts": ts.ScriptKind.TS,
	".tsx": ts.ScriptKind.TSX,
};

/**
 * Read a file by its pathname, and return a corresponding `FileNode`
 * - If the file is a JS source code file, use TypeScript to extract its symbol definitions.
 * - Otherwise, just return the file's contents as the description.
 */
export async function getFileNode(path: string): Promise<PathNode> {
	const ext = extname(path);
	const name = basename(path);
	const scriptKind = EXTENSION_SCRIPT_KIND[ext];

	const source = await readFile(path, { encoding: "utf8" });

	// Any file without a script kind is interpreted as a plain text file.
	if (!scriptKind) return { kind: "file", name, path, description: source, children: [] };

	// Initialise TS to check source files.
	const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, scriptKind);

	return {
		kind: "file",
		name,
		path,
		children: [],
		symbols: [...getSourceFileSymbols(sourceFile)],
		...getSourceFileDocblock(sourceFile),
	};
}
