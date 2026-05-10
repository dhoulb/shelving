import type { Elements } from "../../util/element.js";
import type { AbsolutePath } from "../../util/path.js";
import type { TreeElement, TreeElementProps } from "./TreeElement.js";

/** Props for an element representing a file system path. */
export interface PathElementProps extends TreeElementProps {
	readonly path: AbsolutePath;
}

/** Element representing a file system path (file or directory). */
export interface PathElement<P extends PathElementProps = PathElementProps> extends TreeElement<P> {
	readonly type: "tree-directory" | "tree-file";
}

/** Props for a directory element. */
export interface DirectoryElementProps extends PathElementProps {
	readonly children?: Elements | undefined;
}

/**
 * Element representing a directory in a file tree.
 * - Content is absorbed from an index file (e.g. `README.md` or `INDEX.md`) if present.
 * - Children are the files and subdirectories within this directory.
 */
export interface DirectoryElement extends TreeElement<DirectoryElementProps> {
	readonly type: "tree-directory";
}

/** Props for a file element. */
export interface FileElementProps extends PathElementProps {
	readonly children?: Elements | undefined;
}

/**
 * Element representing a file in a file tree.
 * - For TypeScript files, children are the exported code symbols.
 * - For Markdown files, children are typically empty (content is the parsed markdown).
 */
export interface FileElement extends TreeElement<FileElementProps> {
	readonly type: "tree-file";
}
